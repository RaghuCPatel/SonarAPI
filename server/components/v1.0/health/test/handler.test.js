import dotenv from 'dotenv';
import chai from 'chai';
import {replyToHealthPing} from '../handler';
dotenv.config();
let expect = chai.expect;
describe('health api handler', () => {
  it('should return result as pong', async () => {
    let response = await replyToHealthPing();
    expect(response).to.have.deep.include({ result: 'pong'});
  });
});
