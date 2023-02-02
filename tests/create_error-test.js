const chai = require ( 'chai' );
const rewire = require ( 'rewire' );
const MultiDkim = rewire ( '../index.js' );

const expect = chai.expect;


describe ( 'Return error', () => {
    const create_error = MultiDkim.__get__ ( 'create_error' );

    it ( 'Should return an error object' , () => {
        const err = create_error ( 'test-error' );
        expect ( err.message ).to.equal ( 'test-error' );
        expect ( err.responseCode ).to.equal ( 550 );
        expect ( err ).to.be.instanceof ( Error );
    } );
} );
