const chai = require ( 'chai' );
const sinon = require ( 'sinon' );
const rewire = require ( 'rewire' );
const MultiDkim = rewire ( '../index.js' );

const expect = chai.expect;


const METHODS = [
    'header_replace_xClientId',
    'create_error',
    'add_optional_headers',
    'header_addnot_xCampaignId',
    'header_addnot_feedbackId',
    'get_from_domain',
    'header_set_returnPath',
    'header_replace_messageId',
    'header_replace_xMailer',
    'header_addnot_listUnsubscribe',
    'is_campaign_type_valid'
];


describe ( 'Test module init', () => {
    let app_mock;
    let done_mock = sinon.stub ().returns ();
    let next_mock = sinon.stub ().returns ();
    const PRIV_KEYS = MultiDkim.__get__ ( 'PRIV_KEYS' );
    
    beforeEach ( ()  => {        
        app_mock = {
            config: {},
            addHook ( type, cb ) {
                cb ( 'random-delivery', {}, next_mock );
            }
        };

        PRIV_KEYS [ 'random-key' ] = 'random-key-datas';
    } );
    
    
    afterEach ( sinon.reset );
    
    
    it ( 'Calls', () => {
        app_mock.config [ 'selector' ] = 'random-selector';
        
        var load_dkim_keys_stub = sinon.stub ().returns ( true );
        var get_dkim_key_stub = sinon.stub ().returns ( 'random-key' );
        var create_error_stub = sinon.stub ();
        var get_from_domain_stub = sinon.stub ().returns ( 'random-from-domain' );
        var delivery_dkim_push_key_stub = sinon.stub ();
        
        MultiDkim.__set__ ( 'load_dkim_keys', load_dkim_keys_stub );
        MultiDkim.__set__ ( 'get_dkim_key', get_dkim_key_stub );
        MultiDkim.__set__ ( 'create_error', create_error_stub );
        MultiDkim.__set__ ( 'get_from_domain', get_from_domain_stub );
        MultiDkim.__set__ ( 'delivery_dkim_push_key', delivery_dkim_push_key_stub );


        MultiDkim.init (
            app_mock,
            done_mock
        );

        
        expect ( load_dkim_keys_stub.calledOnceWith (
            app_mock
        ) ).to.be.true;
        expect ( get_dkim_key_stub.calledOnceWith (
            app_mock,
            'random-delivery'
        ) ).to.be.true;
        expect ( create_error_stub.callCount ).to.be.equal ( 0 );
        expect ( get_from_domain_stub.calledOnceWith (
            'random-delivery'
        ) ).to.be.true;
        expect ( delivery_dkim_push_key_stub.calledOnceWith (
            'random-delivery',
            {
                domainName: 'random-from-domain',
                keySelector: 'random-selector',
                privateKey: 'random-key-datas'
            }
        ) ).to.be.true;

        expect ( next_mock.calledOnceWith () ).to.be.true;
        expect ( done_mock.calledOnceWith () ).to.be.true;
    } );
    
    
    it ( 'Key not found', () => {
        var load_dkim_keys_stub = sinon.stub ().returns ( true );
        var get_dkim_key_stub = sinon.stub ().returns ( false );
        var create_error_stub = sinon.stub ().returns ( 'random-error' );
        var get_from_domain_stub = sinon.stub ();
        var delivery_dkim_push_key_stub = sinon.stub ();
        
        MultiDkim.__set__ ( 'load_dkim_keys', load_dkim_keys_stub );
        MultiDkim.__set__ ( 'get_dkim_key', get_dkim_key_stub );
        MultiDkim.__set__ ( 'create_error', create_error_stub );
        MultiDkim.__set__ ( 'get_from_domain', get_from_domain_stub );
        MultiDkim.__set__ ( 'delivery_dkim_push_key', delivery_dkim_push_key_stub );


        MultiDkim.init (
            app_mock,
            done_mock
        );

        
        expect ( load_dkim_keys_stub.calledOnceWith (
            app_mock
        ) ).to.be.true;
        expect ( get_dkim_key_stub.calledOnceWith (
            app_mock,
            'random-delivery'
        ) ).to.be.true;
        expect ( create_error_stub.calledOnceWith (
            'Unable to get dkim key'
        ) ).to.be.true;
        expect ( get_from_domain_stub.callCount ).to.be.equal ( 0 );
        expect ( delivery_dkim_push_key_stub.callCount ).to.be.equal ( 0 );

        expect ( next_mock.calledOnceWith (
            'random-error'
        ) ).to.be.true;
        expect ( done_mock.calledOnceWith () ).to.be.true;
    } );
    
    
    it ( 'Unable to load dkim keys', () => {
        var load_dkim_keys_stub = sinon.stub ().returns ( false );
        var get_dkim_key_stub = sinon.stub ();
        var create_error_stub = sinon.stub ();
        var get_from_domain_stub = sinon.stub ();
        var delivery_dkim_push_key_stub = sinon.stub ();
        
        MultiDkim.__set__ ( 'load_dkim_keys', load_dkim_keys_stub );
        MultiDkim.__set__ ( 'get_dkim_key', get_dkim_key_stub );
        MultiDkim.__set__ ( 'create_error', create_error_stub );
        MultiDkim.__set__ ( 'get_from_domain', get_from_domain_stub );
        MultiDkim.__set__ ( 'delivery_dkim_push_key', delivery_dkim_push_key_stub );


        MultiDkim.init (
            app_mock,
            done_mock
        );

        
        expect ( load_dkim_keys_stub.calledOnceWith (
            app_mock
        ) ).to.be.true;
        expect ( get_dkim_key_stub.callCount ).to.be.equal ( 0 );
        expect ( create_error_stub.callCount ).to.be.equal ( 0 );
        expect ( get_from_domain_stub.callCount ).to.be.equal ( 0 );
        expect ( delivery_dkim_push_key_stub.callCount ).to.be.equal ( 0 );

        expect ( next_mock.callCount ).to.be.equal ( 0 );
        expect ( done_mock.calledOnceWith () ).to.be.true;
    } );
} );
