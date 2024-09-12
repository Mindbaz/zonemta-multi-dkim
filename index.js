'use strict';

/*
  Copyright (C) 2024 Mindbaz
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  
  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
  
  --
  
  SMTP authentication with Keycloak
  Validates tokens via API calls
  
  Auth username must be a concatenation of keycloak realm, client_id &
  username, exemple :  random-realm/random-client-id/random-username
*/

const fs = require ( 'fs' );
const path = require ( 'path' );
const config = require ( 'wild-config' );

/**
 * All dkim keys
 * @type {dict}
 */
const PRIV_KEYS = {};


/**
 * Load a DKIM key : {app.config.keys_dir}/{key}.pem
 *
 * @param {PluginInstance} app Zone-mta instance
 * @param {string} key Key file name without extention to load
 *
 * @returns {bool} False if an error occur during loading key. True otherwise
 */
const load_dkim_key = ( app, key ) => {
    /**
     * Current key dkim to load
     * @type {string}
     */
    let key_path = path.join (
        app.config.keys_dir,
        `${key}.pem`
    );
    
    app.logger.info (
        'Plugins/multi-dkim',
        'Load DKIM key : %s',
        key_path
    );
    
    try {
        PRIV_KEYS [ key ] = fs.readFileSync (
            key_path,
            'ascii'
        ).trim ();
    } catch ( err ) {
        app.logger.error (
            'Plugins/multi-dkim',
            'Failed loading key : %s : %s',
            key_path,
            err.message
        );
        return false;
    }
    
    return true;
};


/**
 * Load all DKIM keys
 *
 * @param {PluginInstance} app Zone-mta instance
 * @param {object} config Wild config
 *
 * @returns {bool} True if all keys are loaded. False otherwise
 */
const load_dkim_keys = ( app, config ) => {
    for ( let key of config.multi_dkim.keys ) {
        let is_dkim_loaded = load_dkim_key (
            app,
            key
        );
        
        if ( is_dkim_loaded === false ) {
            return false;
        }
    }
    
    return true;
};


/**
 * Alias to get_dkim_key, used for recursive call
 *
 * @param {PluginInstance} app Zone-mta instance
 * @param {dict} email_datas Email datas
 *
 * @returns {bool|string} Key if found & if dkim loaded. False otherwise
 */
const _get_dkim_key = ( app, email_datas ) => {
    return get_dkim_key (
        app,
        email_datas
    );
};


/**
 * Get DKIM key to use
 *
 * @param {PluginInstance} app Zone-mta instance
 * @param {dict} email_datas Email datas
 *
 * @returns {bool|string} Key if found & if dkim loaded. False otherwise
 */
const get_dkim_key = ( app, email_datas ) => {
    if ( email_datas.headers.hasHeader ( app.config.key_header ) === false ) {
        return false;
    }
    
    /**
     * Current key dkim to use
     * @type {string}
     */
    let key = email_datas.headers.getFirst ( app.config.key_header );
    
    if ( ( key in PRIV_KEYS ) === false ) {
        let load = load_dkim_key (
            app,
            key
        );
        if ( load == true ) {
            return _get_dkim_key (
                app,
                email_datas
            );
        }
        return false;
    }
    
    return key;
};


/**
 * Add dkim key datas on email datas
 *
 * @param {dict} delivery Email datas
 * @param {dict} key_datas Key datas
 */
const delivery_dkim_push_key = ( delivery, key_datas ) => {
    if ( ! delivery.dkim.keys ) {
        delivery.dkim.keys = [];
    }
    delivery.dkim.keys.push ( key_datas );
};


/**
 * Get from domain from email datas
 *
 * @param {dict} delivery Email datas
 *
 * @retuns {string} From domain
 */
const get_from_domain = ( delivery ) => {
    /**
     * Email from. RFC5322
     * @type {string}
     */
    let from = delivery.headers.getFirst ( 'from' );
    from = from.substr (
        from.lastIndexOf ( '@' ) + 1
    );
    from = from.split ( '>' ) [ 0 ];
    return from.toLowerCase ();
};


/**
 * Create header : missing dkim
 *
 * @param {dict} envelope Email datas
 */
const create_header_missing_dkim = ( envelope ) => {
    envelope.headers.add (
        'x-missing-dkim',
        'Key not found'
    );
};


module.exports.title = 'Multiple DKIM signer';
module.exports.init = ( app, done ) => {
    /**
     * Load all dkim keys
     * @type {bool}
     */
    let is_dkims_loaded = load_dkim_keys (
        app,
        config
    );
    if ( is_dkims_loaded === false ) {
        return done ();
    }
    
    
    /**
     * Hook : message:headers, part : receiver. Check if the email can be sign
     *
     * @param {dict} envelope Email datas
     * @param {dict} messageInfo Email infos
     * @param {function} next Callback
     */
    app.addHook ( 'message:headers', ( envelope, messageInfo, next ) => {
        /**
         * DKIM key to use
         * @type {bool|string}
         */
        let key = get_dkim_key (
            app,
            envelope
        );
        
        if ( key === false ) {
            create_header_missing_dkim (
                envelope
            );
        }
        
        next ();
    } );
    
    
    /**
     * Hook : sender:connection (called for every message : even for cached connection), part : sender. Sign email
     *
     * @param {dict} delivery Email datas
     * @param {dict} options Sender datas
     * @param {function} next Callback
     */
    app.addHook ( 'sender:connection', (delivery, options, next) => {
        /**
         * DKIM key to use
         * @type {bool|string}
         */
        let key = get_dkim_key (
            app,
            delivery
        );
        
        if ( key !== false ) {
            // Store DKIM key datas
            delivery_dkim_push_key (
                delivery,
                {
                    domainName: get_from_domain (
                        delivery
                    ),
                    keySelector: app.config.selector,
                    privateKey: PRIV_KEYS [ key ]
                }
            );
        }
        
        next ();
    } );
    
    done ();
};
