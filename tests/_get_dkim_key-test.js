const chai = require ( 'chai' );
const sinon = require ( 'sinon' );
const expect = chai.expect;
const rewire = require ( 'rewire' );
const MultiDkim = rewire ( '../index.js' );


describe ( 'Get dkim key - alias', () => {
    const _get_dkim_key = MultiDkim.__get__ ( '_get_dkim_key' );
    
    
    it ( 'Calls', () => {
        const get_dkim_key_stub = sinon.stub ().returns ( 'random-returns' );
        MultiDkim.__set__ ( 'get_dkim_key', get_dkim_key_stub );

        let ret = _get_dkim_key (
            'random-app',
            'random-email-data'
        );

        expect ( ret ).to.be.equal ( 'random-returns' );
    } );
} );
