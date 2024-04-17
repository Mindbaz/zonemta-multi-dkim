const chai = require ( 'chai' );
const sinon = require ( 'sinon' );
const expect = chai.expect;
const rewire = require ( 'rewire' );
const MultiDkim = rewire ( '../index.js' );


describe ( 'Push dkim key datas', () => {
    var delivery_mock = undefined;
    const get_from_domain = MultiDkim.__get__ ( 'get_from_domain' );
    
    
    beforeEach ( ()  => {
        delivery_mock = {
            headers : {
                getFirst () {}
            }
        };
    } );
    
    
    afterEach ( sinon.reset );
    
    
    it ( 'Get from domain', () => {
        const get_first_stub = sinon
              .stub ( delivery_mock.headers, 'getFirst' )
              .returns ( 'random-name@EXAMPLE.ORG' );
        
        let ret = get_from_domain (
            delivery_mock
        );
        
        expect ( ret ).to.be.equal ( 'example.org' );
        expect ( get_first_stub.callCount ).to.equal ( 1 );
    } );
    
    
    it ( 'Get domain from email with name', () => {
        const get_first_stub = sinon
              .stub ( delivery_mock.headers, 'getFirst' )
              .returns ( 'Random name <random-name@EXAMPLE.ORG>' );
        
        let ret = get_from_domain (
            delivery_mock
        );
        
        expect ( ret ).to.be.equal ( 'example.org' );
        expect ( get_first_stub.callCount ).to.equal ( 1 );
    } );
} );
