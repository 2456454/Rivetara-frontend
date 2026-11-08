import React from 'react';
import {afterEach, beforeEach, expect, test, vi} from 'vitest';
import {cleanup, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Account from '../src/components/Account';
import Customers from '../src/pages/Customers';
import ProposalReview from '../src/components/ProposalReview';
import {api, list, confirmProposal, cancelProposal} from '../src/lib/api';
import {configureAuth, selectBusiness} from '../src/lib/session';
vi.mock('../src/lib/api', () => ({api: vi.fn(), list: vi.fn(), confirmProposal: vi.fn(), cancelProposal: vi.fn()}));
vi.mock('../src/lib/session', () => ({configureAuth: vi.fn(), selectBusiness: vi.fn()}));
afterEach(cleanup);
beforeEach(() => {vi.resetAllMocks();});
const id = '00000000-0000-4000-8000-000000000001';
test('customer form persists details, retains failures and supports editing and archiving', async () => {
  const user = userEvent.setup();
  list.mockResolvedValue([]);
  const customer = {id, name: 'Alex Taylor', email: 'alex@example.com', phone: '', address: '', archived: false};
  api.mockRejectedValueOnce(Error('Offline')).mockResolvedValueOnce(customer);
  render(<Customers/>);
  await screen.findByText('No customers yet. Add your first customer above.');
  await user.type(screen.getByLabelText('Name'), customer.name);
  await user.type(screen.getByLabelText('Email'), customer.email);
  await user.click(screen.getByRole('button', {name: 'Save customer'}));
  await screen.findByText('Customer could not be saved. Your details are still here.');
  expect(screen.getByLabelText('Name').value).toBe(customer.name);
  await user.click(screen.getByRole('button', {name: 'Save customer'}));
  await screen.findByRole('heading', {name: customer.name});
  await user.click(screen.getByRole('button', {name: 'Edit'}));
  expect(screen.getByLabelText('Name').value).toBe(customer.name);
  await user.click(screen.getByRole('button', {name: 'Cancel edit'}));
  api.mockResolvedValueOnce({...customer, archived: true});
  await user.click(screen.getByRole('button', {name: 'Archive'}));
  await screen.findByRole('heading', {name: 'Alex Taylor · Archived'});
  expect(api.mock.calls.at(-1)).toEqual(['/api/customers/' + id, {method: 'PATCH', body: '{"archived":true}'}]);
});
test('voice proposal remains unsaved until confirmation and preserves its ID and edits after timeout', async () => {
  const user = userEvent.setup();
  list.mockResolvedValue([{id, name: 'Alex', archived: false}]);
  confirmProposal.mockRejectedValueOnce(Error('Timeout')).mockResolvedValueOnce({status: 'confirmed'});
  const finished = vi.fn();
  const proposal = {id: 'proposal-1', action: 'create_job', args: {title: 'Repair', customer_name: 'Alex'}};
  render(<ProposalReview proposal={proposal} onFinished={finished}/>);
  await screen.findByRole('option', {name: 'Alex'});
  expect(confirmProposal).not.toHaveBeenCalled();
  await user.selectOptions(screen.getByLabelText('Customer', {exact: false, selector: 'select'}), id);
  const title = screen.getByLabelText('Job title');
  await user.clear(title); await user.type(title, 'Edited repair');
  await user.click(screen.getByRole('button', {name: 'Confirm and save'}));
  await screen.findByRole('alert');
  expect(finished).not.toHaveBeenCalled();
  expect(title.value).toBe('Edited repair');
  await user.click(screen.getByRole('button', {name: 'Confirm and save'}));
  await waitFor(() => expect(finished).toHaveBeenCalledWith('proposal-1', 'Saved successfully.'));
  expect(confirmProposal).toHaveBeenCalledTimes(2);
  for (const [proposalId, args] of confirmProposal.mock.calls) {
    expect(proposalId).toBe('proposal-1'); expect(args.customer_id).toBe(id); expect(args.title).toBe('Edited repair');
  }
});
test('cancelling a proposal never calls confirmation', async () => {
  list.mockResolvedValue([]); cancelProposal.mockResolvedValue({status: 'cancelled'});
  const finished = vi.fn();
  render(<ProposalReview proposal={{id, action: 'add_expense', args: {description: 'Supplies', amount: 12}}} onFinished={finished}/>);
  await userEvent.click(screen.getByRole('button', {name: 'Cancel proposal'}));
  await waitFor(() => expect(cancelProposal).toHaveBeenCalledWith(id));
  expect(confirmProposal).not.toHaveBeenCalled();
});
test('account login verifies access before rendering workspace and business changes reset its scope', async () => {
  const user = userEvent.setup();
  let notify;
  const signInWithPassword = vi.fn(async () => {notify('SIGNED_IN', {access_token: 'test-token'}); return {data: {user: {email_confirmed_at: 'now'}}};});
  configureAuth.mockReturnValue({auth: {
    onAuthStateChange: callback => {notify = callback; return {data: {subscription: {unsubscribe() {}}}};},
    signInWithPassword, signOut: vi.fn(async () => notify('SIGNED_OUT', null))
  }});
  api.mockImplementation(async path => path === '/api/auth/config' ? {url: 'https://example.test', anonKey: 'public'} : {businesses: [
    {tenant_id: 'business-a', organisations: {name: 'Business A'}}, {tenant_id: 'business-b', organisations: {name: 'Business B'}}
  ]});
  const back = vi.fn();
  render(<Account onBack={back}>{tenant => <p>Workspace {tenant}</p>}</Account>);
  await waitFor(() => expect(screen.getByRole('button', {name: 'Sign in'}).disabled).toBe(false));
  expect(screen.queryByText('Workspace business-a')).toBeNull();
  await user.type(screen.getByLabelText('Email'), 'alex@example.com');
  await user.type(screen.getByLabelText('Password'), 'long-password');
  await user.click(screen.getByRole('button', {name: 'Sign in'}));
  await screen.findByText('Workspace business-a');
  expect(selectBusiness).toHaveBeenCalledWith('business-a');
  await user.selectOptions(screen.getByRole('combobox', {name: 'Business'}), 'business-b');
  await screen.findByText('Workspace business-b');
  expect(selectBusiness).toHaveBeenLastCalledWith('business-b');
  await user.click(screen.getByRole('button', {name: 'Sign out'}));
  expect(screen.queryByText('Workspace business-b')).toBeNull();
});
