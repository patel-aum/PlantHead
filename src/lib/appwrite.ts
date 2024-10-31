import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('671e32580018427151e7');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const functionConfig = {
  functionId: '67226b1b0004854a205a',
  projectId: '671e32580018427151e7',
  endpoint: 'https://cloud.appwrite.io/v1'
};

export const appwriteConfig = {
  projectId: '671e32580018427151e7',
  databaseId: '671e32c900043f645463',
  bucketId: '6721b87d0027ddd0f35a',
  collectionId: '671e32d200116c6252e3'
};
export const postAppwriteConfig= {
  projectId: '671e32580018427151e7',
  databaseId: '671e32c900043f645463',
  bucketId: '6721d2450004d9e9e0ec',
  collectionId: '6721d14d001693f08f6a'
};



