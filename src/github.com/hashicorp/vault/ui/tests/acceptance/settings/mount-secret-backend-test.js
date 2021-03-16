import { currentRouteName } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import page from 'vault/tests/pages/settings/mount-secret-backend';
import configPage from 'vault/tests/pages/secrets/backend/configuration';
import authPage from 'vault/tests/pages/auth';

module('Acceptance | settings/mount-secret-backend', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function() {
    return authPage.login();
  });

  test('it sets the ttl correctly when mounting', async function(assert) {
    // always force the new mount to the top of the list
    const path = `kv-${new Date().getTime()}`;
    const defaultTTLHours = 100;
    const maxTTLHours = 300;
    const defaultTTLSeconds = defaultTTLHours * 60 * 60;
    const maxTTLSeconds = maxTTLHours * 60 * 60;

    await page.visit();

    assert.equal(currentRouteName(), 'vault.cluster.settings.mount-secret-backend');
    await page.selectType('kv');
    await page
      .next()
      .path(path)
      .toggleOptions()
      .enableDefaultTtl()
      .defaultTTLUnit('h')
      .defaultTTLVal(defaultTTLHours)
      .enableMaxTtl()
      .maxTTLUnit('h')
      .maxTTLVal(maxTTLHours)
      .submit();
    await configPage.visit({ backend: path });
    assert.equal(configPage.defaultTTL, defaultTTLSeconds, 'shows the proper TTL');
    assert.equal(configPage.maxTTL, maxTTLSeconds, 'shows the proper max TTL');
  });

  test('it sets the ttl when enabled then disabled', async function(assert) {
    // always force the new mount to the top of the list
    const path = `kv-${new Date().getTime()}`;
    const maxTTLHours = 300;
    const maxTTLSeconds = maxTTLHours * 60 * 60;

    await page.visit();

    assert.equal(currentRouteName(), 'vault.cluster.settings.mount-secret-backend');
    await page.selectType('kv');
    await page
      .next()
      .path(path)
      .toggleOptions()
      .enableDefaultTtl()
      .enableDefaultTtl()
      .enableMaxTtl()
      .maxTTLUnit('h')
      .maxTTLVal(maxTTLHours)
      .submit();
    await configPage.visit({ backend: path });
    assert.equal(configPage.defaultTTL, 0, 'shows the proper TTL');
    assert.equal(configPage.maxTTL, maxTTLSeconds, 'shows the proper max TTL');
  });
});
