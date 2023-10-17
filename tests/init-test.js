const chai = require ( 'chai' );
const sinon = require ( 'sinon' );
const rewire = require ( 'rewire' );
const MultiDkim = rewire ( '../index.js' );

const expect = chai.expect;


const METHODS = [
    'header_replace_xClientId',
    'create_header_missing_dkim',
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
        var create_header_missing_dkim_stub = sinon.stub ();
        var get_from_domain_stub = sinon.stub ().returns ( 'random-from-domain' );
        var delivery_dkim_push_key_stub = sinon.stub ();
        
        MultiDkim.__set__ ( 'load_dkim_keys', load_dkim_keys_stub );
        MultiDkim.__set__ ( 'get_dkim_key', get_dkim_key_stub );
        MultiDkim.__set__ ( 'create_header_missing_dkim', create_header_missing_dkim_stub );
        MultiDkim.__set__ ( 'get_from_domain', get_from_domain_stub );
        MultiDkim.__set__ ( 'delivery_dkim_push_key', delivery_dkim_push_key_stub );


        MultiDkim.init (
            app_mock,
            done_mock
        );
        
        // Pre-hook
        
        expect ( load_dkim_keys_stub.callCount ).to.be.equal ( 1 );
        const load_dkim_keys_args = load_dkim_keys_stub.getCall ( 0 ).args;
        expect ( load_dkim_keys_args [ 0 ] ).to.be.equal ( app_mock );
        expect ( typeof ( load_dkim_keys_args [ 1 ] ) ).to.be.equal ( 'object' );
        
        // Hook : message:headers
        
        expect ( get_dkim_key_stub.callCount ).to.be.equal ( 2 );
        expect ( get_dkim_key_stub.getCalls () [ 0 ].args ).to.be.eql ( [
            app_mock,
            'random-delivery'
        ] );
        expect ( create_header_missing_dkim_stub.callCount ).to.be.equal ( 0 );
        
        // Hook : sender:connect
        
        expect ( get_dkim_key_stub.getCalls () [ 1 ].args ).to.be.eql ( [
            app_mock,
            'random-delivery'
        ] );
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
        
        expect ( next_mock.callCount ).to.be.equal ( 2 );
        expect ( done_mock.calledOnceWith () ).to.be.true;
    } );
    
    
    it ( 'Key not found', () => {
        var load_dkim_keys_stub = sinon.stub ().returns ( true );
        var get_dkim_key_stub = sinon.stub ().returns ( false );
        var create_header_missing_dkim_stub = sinon.stub ().returns ( 'random-error' );
        var get_from_domain_stub = sinon.stub ();
        var delivery_dkim_push_key_stub = sinon.stub ();
        
        MultiDkim.__set__ ( 'load_dkim_keys', load_dkim_keys_stub );
        MultiDkim.__set__ ( 'get_dkim_key', get_dkim_key_stub );
        MultiDkim.__set__ ( 'create_header_missing_dkim', create_header_missing_dkim_stub );
        MultiDkim.__set__ ( 'get_from_domain', get_from_domain_stub );
        MultiDkim.__set__ ( 'delivery_dkim_push_key', delivery_dkim_push_key_stub );
    
    
        MultiDkim.init (
            app_mock,
            done_mock
        );
        
        // Pre-hook
        
        expect ( load_dkim_keys_stub.calledOnceWith (
            app_mock
        ) ).to.be.true;
        
        // Hook : message:headers
        
        expect ( get_dkim_key_stub.callCount ).to.be.equal ( 2 );
        expect ( get_dkim_key_stub.getCalls () [ 0 ].args ).to.be.eql ( [
            app_mock,
            'random-delivery'
        ] );
        expect ( create_header_missing_dkim_stub.calledOnceWith (
            'random-delivery'
        ) ).to.be.true;
        
        // Hook : sender:connect
        
        expect ( get_dkim_key_stub.getCalls () [ 1 ].args ).to.be.eql ( [
            app_mock,
            'random-delivery'
        ] );
        expect ( get_from_domain_stub.callCount ).to.be.equal ( 0 );
        expect ( delivery_dkim_push_key_stub.callCount ).to.be.equal ( 0 );
        
        expect ( next_mock.callCount ).to.be.equal ( 2 );
        expect ( done_mock.calledOnceWith () ).to.be.true;
    } );
    
    
    it ( 'Unable to load dkim keys', () => {
        var load_dkim_keys_stub = sinon.stub ().returns ( false );
        var get_dkim_key_stub = sinon.stub ();
        var create_header_missing_dkim_stub = sinon.stub ();
        var get_from_domain_stub = sinon.stub ();
        var delivery_dkim_push_key_stub = sinon.stub ();
        
        MultiDkim.__set__ ( 'load_dkim_keys', load_dkim_keys_stub );
        MultiDkim.__set__ ( 'get_dkim_key', get_dkim_key_stub );
        MultiDkim.__set__ ( 'create_header_missing_dkim', create_header_missing_dkim_stub );
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
        expect ( create_header_missing_dkim_stub.callCount ).to.be.equal ( 0 );
        expect ( get_from_domain_stub.callCount ).to.be.equal ( 0 );
        expect ( delivery_dkim_push_key_stub.callCount ).to.be.equal ( 0 );
    
        expect ( next_mock.callCount ).to.be.equal ( 0 );
        expect ( done_mock.calledOnceWith () ).to.be.true;
    } );
} );
