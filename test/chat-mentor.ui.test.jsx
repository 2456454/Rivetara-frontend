import React from 'react';
import {test,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,cleanup,waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Chat from '../src/components/Chat';
import WorkDraft from '../src/components/WorkDraft';
import Mentor from '../src/pages/Mentor';
import {api,list} from '../src/lib/api';
vi.mock('../src/lib/api',()=>({api:vi.fn(),list:vi.fn(),consents:vi.fn()}));
beforeEach(()=>{vi.resetAllMocks();list.mockResolvedValue([]);});
afterEach(cleanup);
const id='00000000-0000-4000-8000-000000000001';
test('an incomplete invoice can be saved without amount or contact fields',async()=>{
 const user=userEvent.setup();const draft={id,kind:'invoice',version:1,data:{customer_name:'Alex'}};
 api.mockResolvedValue({...draft,version:2});const changed=vi.fn();
 render(<WorkDraft draft={draft} onChanged={changed}/>);
 expect(screen.getByRole('button',{name:'Create invoice draft'}).disabled).toBe(true);
 await user.click(screen.getByRole('button',{name:'Save progress'}));
 await waitFor(()=>expect(changed).toHaveBeenCalled());
 expect(JSON.parse(api.mock.calls[0][1].body).data).toEqual({customer_name:'Alex'});
 await screen.findByText('Progress saved. You can finish this later.');
});
test('Chat restores history and keeps the composer usable while an incomplete draft is open',async()=>{
 const user=userEvent.setup();
 const draft={id,kind:'invoice',version:1,data:{customer_name:'Alex'}};
 api.mockImplementation(async(path,options)=>{
  if(path.startsWith('/api/chat?'))return {session:{id:'session-1'},turns:[{id:'turn-1',message:'Invoice Alex; price later',reply:'Saved as a working draft.',state:'complete'}],drafts:[draft]};
  if(path==='/api/chat/message'){const body=JSON.parse(options.body);return {turn:{id:body.request_id,message:body.message,reply:'Added the amount. You can still finish later.',state:'complete'},drafts:[{...draft,version:2,data:{customer_name:'Alex',amount:125}}]};}
 });
 render(<Chat/>);
 await screen.findByText('Invoice Alex; price later');
 const input=screen.getByLabelText('Message Rivetara');expect(input.disabled).toBe(false);
 await user.type(input,'The price is £125');
 await user.click(screen.getByRole('button',{name:'Send message'}));
 await screen.findByText('Added the amount. You can still finish later.');
 expect(screen.getByLabelText('Amount (£)').value).toBe('125');
 expect(input.disabled).toBe(false);
 expect(screen.getByRole('button',{name:'Create invoice draft'}).disabled).toBe(true);
});
test('business-building profile is optional and milestone evidence restores after saving',async()=>{
 const user=userEvent.setup();let profile=null,progress=[];
 const modules=[{id:'direction',title:'Find your starting point',outcome:'A clear offer.',lesson:'Start small.',exercise:'Describe your customer and service.',next:'Talk to three potential customers.',links:[]}];
 api.mockImplementation(async(path,options)=>{
  if(path==='/api/mentor')return {modules,profile,progress};
  const body=JSON.parse(options.body);
  if(path==='/api/mentor/profile'){profile={id:'profile-1',data:body.data,version:1};return profile;}
  if(path==='/api/mentor/progress/direction'){const row={id:'progress-1',milestone:'direction',notes:body.notes,completed:body.completed,version:1};progress=[row];return row;}
 });
 const view=render(<Mentor/>);
 await screen.findByRole('heading',{name:'Turn “one day” into a next step.'});
 await user.type(screen.getByLabelText('What business or service are you exploring?'),'Weekend gardening');
 await user.click(screen.getByRole('button',{name:'Save my starting point'}));
 await screen.findByText('Your starting point is saved. You can change it as your idea develops.');
 await user.type(screen.getByLabelText('Your notes and evidence'),'I help local households keep their gardens tidy.');
 await user.click(screen.getByRole('button',{name:'Mark milestone complete'}));
 await screen.findByText('1 of 1 milestones complete');
 view.unmount();render(<Mentor/>);
 await screen.findByText('1 of 1 milestones complete');
 expect(screen.getByLabelText('Your notes and evidence').value).toBe('I help local households keep their gardens tidy.');
});
