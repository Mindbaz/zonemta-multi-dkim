const chai = require ( 'chai' );
const sinon = require ( 'sinon' );
const expect = chai.expect;
const rewire = require ( 'rewire' );
const MultiDkim = rewire ( '../index.js' );


describe ( 'Create header : missing dkim', () => {
    var envelope_mock = undefined;
    const create_header_missing_dkim = MultiDkim.__get__ ( 'create_header_missing_dkim' );
    
    
    beforeEach ( ()  => {
        envelope_mock = {
            headers: {
                add () {}
            }
        };
    } );
    
    
    afterEach ( sinon.reset );
    
    
    it ( 'Set header', () => {
        const add_stub = sinon
              .stub ( envelope_mock.headers, 'add' )
              .returns ( true );

        create_header_missing_dkim (
            envelope_mock
        );
        
        expect ( add_stub.calledOnceWith (
            'x-missing-dkim',
            'Key not found'
        ) ).to.be.true;
        
        add_stub.restore ();
    } );
} );
