'use strict';

var Analytics = require('@segment/analytics.js-core').constructor;
var integrationTester = require('@segment/analytics.js-integration-tester');
var integration = require('@segment/analytics.js-integration');
var sandbox = require('@segment/clear-env');
var MoEngage = require('../lib/');

describe('MoEngage', function() {
  var analytics;
  var moengage;
  var options = {
    appId: 'AJ1WTFKFAMAG8045ZXSQ9GMK',
    debugMode: false
  };

  beforeEach(function() {
    analytics = new Analytics();
    moengage = new MoEngage(options);
    analytics.use(integrationTester);
    analytics.use(MoEngage);
    analytics.add(moengage);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    moengage.reset();
    sandbox();
  });

  it('should have the correct options', function() {
    analytics.compare(MoEngage, integration('MoEngage')
    .option('apiKey', '')
    .option('debugMode', false));
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.stub(moengage, 'load');
    });

    describe('#initialize', function() {
      it('should call load', function() {
        analytics.initialize();
        analytics.called(moengage.load);
      });
    });
  });

  describe('loading', function() {
    // TODO: skipping because we don't have a reliable way to test service workers
    // and since ME SDK relies on serviceworker.js this test timeouts
    it.skip('should load', function(done) {
      analytics.load(moengage, done);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
    });

    describe('#identify', function() {
      beforeEach(function() {
        analytics.stub(moengage._client, 'add_first_name');
        analytics.stub(moengage._client, 'add_last_name');
        analytics.stub(moengage._client, 'add_email');
        analytics.stub(moengage._client, 'add_mobile');
        analytics.stub(moengage._client, 'add_user_name');
        analytics.stub(moengage._client, 'add_gender');
        analytics.stub(moengage._client, 'add_birthday');
        analytics.stub(moengage._client, 'add_user_attribute');
        analytics.stub(moengage._client, 'add_unique_user_id');
      });

      it('should send identify', function() {
        var traits = {
          firstName: 'han',
          lastName: 'solo',
          email: 'han@segment.com',
          phone: '4012229047',
          username: 'hanothan',
          gender: 'male',
          birthday: '08/13/1991',
          customTrait: true
        };
        analytics.identify('han123', traits);
        analytics.called(moengage._client.add_unique_user_id, 'han123');
        analytics.called(moengage._client.add_first_name, traits.firstName);
        analytics.called(moengage._client.add_last_name, traits.lastName);
        analytics.called(moengage._client.add_email, traits.email);
        analytics.called(moengage._client.add_mobile, traits.phone);
        analytics.called(moengage._client.add_user_name, traits.username);
        analytics.called(moengage._client.add_gender, traits.gender);
        analytics.called(moengage._client.add_birthday, traits.birthday);
        analytics.called(moengage._client.add_user_attribute, 'customTrait', traits.customTrait);
      });
    });

    describe('#track', function() {
      beforeEach(function() {
        analytics.stub(moengage._client, 'track_event');
      });

      it('should send track', function() {
        var properties = {
          ice: 'fire',
          nested: ['ha', 'haha', { hahaha: 'hahahahaha' }],
          andThis: { gucci: [], mane: true }
        };
        analytics.track('The Song', properties);
        analytics.called(moengage._client.track_event, 'The Song', properties);
      });
    });
  });
});
