const chai = require ( 'chai' );
const sinon = require ( 'sinon' );
const expect = chai.expect;
const rewire = require ( 'rewire' );
const MultiDkim = rewire ( '../index.js' );


describe ( 'Get DKIM key to use', () => {
    var app_mock = undefined;
    var delivery_mock = undefined;
    const create_error_missing_dkim_key = MultiDkim.__get__ ( 'create_error_missing_dkim_key' );
    
    
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
    } );
    
    
    afterEach ( sinon.reset );
    
    
    it ( 'Key not found', () => {
        app_mock.config [ 'key_header' ] = 'random-header';
        
        const has_header_stub = sinon
              .stub ( delivery_mock.headers, 'hasHeader' )
              .returns ( false );
        
        const get_first_stub = sinon
              .stub ( delivery_mock.headers, 'getFirst' );
        
        var create_error_stub = sinon.stub ().returns ( 'random-error' );
        MultiDkim.__set__ ( 'create_error', create_error_stub );
        
        let ret = create_error_missing_dkim_key (
            app_mock,
            delivery_mock
        );

        expect ( ret ).to.be.equal ( 'random-error' );
        
        expect ( has_header_stub.calledOnceWith (
            'random-header'
        ) ).to.be.true;
        expect ( get_first_stub.callCount ).to.be.equal ( 0 );
        expect ( create_error_stub.calledOnceWith (
            'Unable to get dkim key, missing header key'
        ) ).to.be.true;
        
        get_first_stub.restore ();
        has_header_stub.restore ();
    } );
    
    
    it ( 'Key found', () => {
        app_mock.config [ 'key_header' ] = 'random-header';
        
        const has_header_stub = sinon
              .stub ( delivery_mock.headers, 'hasHeader' )
              .returns ( true );
        
        const get_first_stub = sinon
              .stub ( delivery_mock.headers, 'getFirst' )
              .returns ( 'random-header-value' );
        
        var create_error_stub = sinon.stub ().returns ( 'random-error' );
        MultiDkim.__set__ ( 'create_error', create_error_stub );
        
        let ret = create_error_missing_dkim_key (
            app_mock,
            delivery_mock
        );

        expect ( ret ).to.be.equal ( 'random-error' );
        
        expect ( has_header_stub.calledOnceWith (
            'random-header'
        ) ).to.be.true;
        expect ( get_first_stub.calledOnceWith (
            'random-header'
        ) ).to.be.true;
        expect ( create_error_stub.calledOnceWith (
            'Unable to get dkim key for random-header-value'
        ) ).to.be.true;
        
        get_first_stub.restore ();
        has_header_stub.restore ();
    } );
} );
