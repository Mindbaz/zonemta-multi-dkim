const chai = require ( 'chai' );
const sinon = require ( 'sinon' );
const expect = chai.expect;
const rewire = require ( 'rewire' );
const MultiDkim = rewire ( '../index.js' );


describe ( 'Get DKIM key to use', () => {
    var app_mock = undefined;
    var delivery_mock = undefined;
    const get_dkim_key = MultiDkim.__get__ ( 'get_dkim_key' );
    const PRIV_KEYS = MultiDkim.__get__ ( 'PRIV_KEYS' );
    
    
    beforeEach ( ()  => {
        app_mock = {
            config: {}
        };
        
        delivery_mock = {
            headers: {
                hasHeader () {},
                getFirst () {}
            }
        };
        
        for ( key in PRIV_KEYS ) {
            delete ( PRIV_KEYS [ key ] );
        }
    } );
    
    
    afterEach ( sinon.reset );
    
    
    it ( 'Key found', () => {
        app_mock.config [ 'key_header' ] = 'random-header';
        PRIV_KEYS [ 'random-key' ] = 'random-key-datas';
        
        const has_header_stub = sinon
              .stub ( delivery_mock.headers, 'hasHeader' )
              .returns ( true );
        
        const get_first_stub = sinon
              .stub ( delivery_mock.headers, 'getFirst' )
              .returns ( 'random-key' );

        let ret = get_dkim_key (
            app_mock,
            delivery_mock
        );
        
        expect ( ret ).to.be.equal ( 'random-key' );

        expect ( has_header_stub.calledOnceWith (
            'random-header'
        ) ).to.be.true;
        expect ( get_first_stub.calledOnceWith (
            'random-header'
        ) ).to.be.true;
        
        get_first_stub.restore ();
        has_header_stub.restore ();
    } );
    
    
    it ( 'Key not loaded', () => {
        app_mock.config [ 'key_header' ] = 'random-header';
        PRIV_KEYS [ 'another-key' ] = 'random-key-datas';
        
        const has_header_stub = sinon
              .stub ( delivery_mock.headers, 'hasHeader' )
              .returns ( true );
        
        const get_first_stub = sinon
              .stub ( delivery_mock.headers, 'getFirst' )
              .returns ( 'random-key' );

        let ret = get_dkim_key (
            app_mock,
            delivery_mock
        );
        
        expect ( ret ).to.be.false;

        expect ( has_header_stub.calledOnceWith (
            'random-header'
        ) ).to.be.true;
        expect ( get_first_stub.calledOnceWith (
            'random-header'
        ) ).to.be.true;

        get_first_stub.restore ();
        has_header_stub.restore ();
    } );
    
    
    it ( 'Header not found', () => {
        app_mock.config [ 'key_header' ] = 'random-header';
        
        const has_header_stub = sinon
              .stub ( delivery_mock.headers, 'hasHeader' )
              .returns ( false );
        
        const get_first_stub = sinon
              .stub ( delivery_mock.headers, 'getFirst' );
        
        let ret = get_dkim_key (
            app_mock,
            delivery_mock
        );
        
        expect ( ret ).to.be.false;
        
        expect ( has_header_stub.calledOnceWith (
            'random-header'
        ) ).to.be.true;
        expect ( get_first_stub.callCount ).to.be.equal ( 0 );

        get_first_stub.restore ();
        has_header_stub.restore ();
    } );
} );
