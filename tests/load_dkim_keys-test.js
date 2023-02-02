const chai = require ( 'chai' );
const sinon = require ( 'sinon' );
const expect = chai.expect;
const rewire = require ( 'rewire' );
const MultiDkim = rewire ( '../index.js' );


describe ( 'Load DKIM key', () => {
    var app_mock = undefined;
    const load_dkim_keys = MultiDkim.__get__ ( 'load_dkim_keys' );
    
    
    beforeEach ( ()  => {
        app_mock = {
            config: {}
        };
    } );
    
    
    afterEach ( sinon.reset );
    
    
    it ( 'Returns true', () => {
        app_mock.config [ 'keys' ] = [
            'random-keys-1',
            'random-keys-2',
            'random-keys-3'
        ];

        var load_dkim_key_stub = sinon.stub ().returns ( true );
        MultiDkim.__set__ ( 'load_dkim_key', load_dkim_key_stub );

        let ret = load_dkim_keys (
            app_mock
        );

        expect ( ret ).to.be.true;
        
        expect ( load_dkim_key_stub.getCalls () [ 0 ].args [ 0 ] ).to.be.eql ( app_mock );
        expect ( load_dkim_key_stub.getCalls () [ 0 ].args [ 1 ] ).to.be.eql ( 'random-keys-1' );
        expect ( load_dkim_key_stub.getCalls () [ 1 ].args [ 0 ] ).to.be.eql ( app_mock );
        expect ( load_dkim_key_stub.getCalls () [ 1 ].args [ 1 ] ).to.be.eql ( 'random-keys-2' );
        expect ( load_dkim_key_stub.getCalls () [ 2 ].args [ 0 ] ).to.be.eql ( app_mock );
        expect ( load_dkim_key_stub.getCalls () [ 2 ].args [ 1 ] ).to.be.eql ( 'random-keys-3' );
    } );
    
    
    it ( 'Returns false', () => {
        app_mock.config [ 'keys' ] = [
            'random-keys-1',
            'random-keys-2',
            'random-keys-3'
        ];

        var load_dkim_key_stub = sinon.stub ().returns ( false );
        MultiDkim.__set__ ( 'load_dkim_key', load_dkim_key_stub );

        let ret = load_dkim_keys (
            app_mock
        );

        expect ( ret ).to.be.false;
        expect ( load_dkim_key_stub.calledOnceWith (
            app_mock,
            'random-keys-1'
        ) ).to.be.true;

    } );
} );
