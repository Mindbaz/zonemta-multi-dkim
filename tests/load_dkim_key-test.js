const fs = require ( 'fs' );
const chai = require ( 'chai' );
const sinon = require ( 'sinon' );
const expect = chai.expect;
const rewire = require ( 'rewire' );
const MultiDkim = rewire ( '../index.js' );


describe ( 'Load DKIM key', () => {
    var app_mock = undefined;
    const load_dkim_key = MultiDkim.__get__ ( 'load_dkim_key' );
    const PRIV_KEYS = MultiDkim.__get__ ( 'PRIV_KEYS' );
    
    
    beforeEach ( ()  => {
        app_mock = {
            config: {},
            logger: {
                info: function () {
                    console.log ( arguments );
                },
                error: function () {
                    console.log ( arguments );
                }
            }
        };

        for ( key in PRIV_KEYS ) {
            delete ( PRIV_KEYS [ key ] );
        }
    } );
    
    
    afterEach ( sinon.reset );
    
    
    it ( 'Should add key' , () => {
        app_mock.config [ 'keys_dir' ] = 'random-keys-dir';

        var readFileSync_stub = sinon
            .stub ( fs, 'readFileSync' )
            .returns ( '  random-key-datas  ' );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        var log_error_stub = sinon
            .stub ( app_mock.logger, 'error' );
        
        let ret = load_dkim_key (
            app_mock,
            'random-key'
        );
        
        expect ( ret ).to.be.true;
        expect ( PRIV_KEYS [ 'random-key' ] ).to.be.equal ( 'random-key-datas' );

        expect ( readFileSync_stub.calledOnceWith (
            'random-keys-dir/random-key.pem',
            'ascii'
        ) ).to.be.true;
        expect ( log_info_stub.callCount ).to.equal ( 1 );
        expect ( log_error_stub.callCount ).to.equal ( 0 );
        
        log_error_stub.restore ();
        log_info_stub.restore ();
        readFileSync_stub.restore ();
    } );
    
    
    it ( 'Error during read key file' , () => {
        app_mock.config [ 'keys_dir' ] = 'random-keys-dir';

        var readFileSync_stub = sinon
            .stub ( fs, 'readFileSync' )
            .throws ( new Error ( 'Random expcetion' ) );
        
        var log_info_stub = sinon
            .stub ( app_mock.logger, 'info' );
        
        var log_error_stub = sinon
            .stub ( app_mock.logger, 'error' );
        
        let ret = load_dkim_key (
            app_mock,
            'random-key'
        );
        
        expect ( ret ).to.be.false;
        expect ( 'random-key' in PRIV_KEYS ).to.be.false;
        
        expect ( readFileSync_stub.calledOnceWith (
            'random-keys-dir/random-key.pem',
            'ascii'
        ) ).to.be.true;
        expect ( log_info_stub.callCount ).to.equal ( 1 );
        expect ( log_error_stub.calledOnceWith (
            'Plugins/multi-dkim',
            'Failed loading key : %s : %s',
            'random-keys-dir/random-key.pem',
            'Random expcetion'
        ) ).to.be.true;
        
        log_error_stub.restore ();
        log_info_stub.restore ();
        readFileSync_stub.restore ();
    } );
} );
