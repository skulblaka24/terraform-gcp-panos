import { create, clickable, fillable, visitable } from 'ember-cli-page-object';
import ListView from 'vault/tests/pages/components/list-view';

export default create({
  ...ListView,
  visit: visitable('/vault/secrets/:backend/list?tab=alphabet'),
  visitCreate: visitable('/vault/secrets/:backend/create?itemType=alphabet'),
  createLink: clickable('[data-test-secret-create="true"]'),
  editLink: clickable('[data-test-edit-link="true"]'),
  name: fillable('[data-test-input="name"]'),
  alphabet: fillable('[data-test-input="alphabet"'),
  submit: clickable('[data-test-alphabet-transform-create="true"]'),
});
