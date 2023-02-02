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
            envelope: {}
        };
    } );
    
    
    afterEach ( sinon.reset );
    
    
    it ( 'Get from domain', () => {
        delivery_mock.envelope.from = 'example@RANDOM-DOMAIN';

        let ret = get_from_domain (
            delivery_mock
        );

        expect ( ret ).to.be.equal ( 'random-domain' );
    } );
} );
