const chai = require ( 'chai' );
const sinon = require ( 'sinon' );
const expect = chai.expect;
const rewire = require ( 'rewire' );
const MultiDkim = rewire ( '../index.js' );


describe ( 'Push dkim key datas', () => {
    var delivery_mock = undefined;
    const delivery_dkim_push_key = MultiDkim.__get__ ( 'delivery_dkim_push_key' );
    
    
    beforeEach ( ()  => {
        delivery_mock = {
            dkim: {}
        };
    } );
    
    
    afterEach ( sinon.reset );
    
    
    it ( 'Create keys & push key', () => {
        delivery_dkim_push_key (
            delivery_mock,
            'random-key-datas'
        );

        expect ( delivery_mock.dkim.keys ).to.be.eql ( [
            'random-key-datas'
        ] );
    } );
    
    
    it ( 'Already exists keys & push key', () => {
        delivery_mock.dkim.keys = [
            'another-key-datas'
        ];
        
        delivery_dkim_push_key (
            delivery_mock,
            'random-key-datas'
        );

        expect ( delivery_mock.dkim.keys ).to.be.eql ( [
            'another-key-datas',
            'random-key-datas'
        ] );
    } );
} );
