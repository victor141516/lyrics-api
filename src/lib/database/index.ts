import { Collection, FilterQuery, MongoClient } from 'mongodb';

export class Database {
  private readonly client: MongoClient;
  private readonly collections: Promise<{
    urls: Collection;
    lyrics: Collection;
  }>;

  constructor(mongoUrl: string) {
    this.client = new MongoClient(mongoUrl);

    this.collections = new Promise((res, rej) => {
      this.client.connect((err) => {
        if (err) rej(err);
        else
          res({
            urls: this.client.db('lyrics-api').collection('urls'),
            lyrics: this.client.db('lyrics-api').collection('lyrics'),
          });
      });
    });
  }

  private async insert(collection: 'urls' | 'lyrics', doc: any): Promise<void> {
    return new Promise(async (resolve, reject) =>
      (await this.collections)[collection].insertOne(doc, (err) => {
        if (err) reject(err);
        else resolve();
      }),
    );
  }

  private async get(
    collection: 'urls' | 'lyrics',
    filter: FilterQuery<any>,
  ): Promise<any> {
    return new Promise(async (resolve, reject) =>
      (await this.collections)[collection].findOne(filter, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }),
    );
  }

  async insertUrl(query: string, url: string): Promise<void> {
    return this.insert('urls', { query, url });
  }

  async insertLyric(url: string, lyric: string): Promise<void> {
    return this.insert('lyrics', { url, lyric });
  }

  async getUrl(query: string): Promise<string | undefined> {
    return (await this.get('urls', { query }))?.url;
  }

  async getLyric(url: string): Promise<string | undefined> {
    return (await this.get('lyrics', { url }))?.lyric;
  }

  async quit(): Promise<void> {
    return this.client.close();
  }
}
