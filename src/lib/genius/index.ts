import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import { Database } from '../database';

export class GeniusApiError extends Error {}

export class GeniusApi {
  private readonly apiKey: string;
  private readonly cache?: Database;

  constructor(apiKey: string, cache?: Database) {
    this.apiKey = apiKey;
    this.cache = cache;
  }

  private async getUrlOfSong(query: string): Promise<string | null> {
    let url: string;
    if (this.cache) {
      url = await this.cache.getUrl(query);
      if (url) return url;
    }

    const response = await fetch(
      `https://api.genius.com/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      },
    ).then((r) => r.json());

    if (response.meta.status !== 200) throw new GeniusApiError(response);
    else {
      url = response.response.hits[0]?.result?.url;
      if (url) {
        this.cache.insertUrl(query, url);
      }
      return url;
    }
  }

  private async getLyricsFromUrl(songUrl: string): Promise<string> {
    let lyric: string;
    if (this.cache) {
      lyric = await this.cache.getLyric(songUrl);
      if (lyric) return lyric;
    }

    const dom = await fetch(songUrl)
      .then((r) => r.text())
      .then((r) => new JSDOM(r));

    const element = dom.window.document.querySelector(
      'div.lyrics',
    ) as HTMLDivElement;

    if (!element) return null;

    lyric = element.innerHTML
      .replace(/<!--.*-->/g, '')
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n')
      .replace(/<br>/g, '\n')
      .replace(/\n\n/g, '\n')
      .trim();

    if (lyric) {
      this.cache.insertLyric(songUrl, lyric);
    }
    return lyric;
  }

  async getLyrics(query: string) {
    return new Promise(async (res, rej) => {
      const url = await this.getUrlOfSong(query);
      if (!url) return rej(new GeniusApiError('Cannot find song'));
      let retry = 0;
      while (retry < 5) {
        const result = await this.getLyricsFromUrl(url);
        if (result !== null) {
          return res(result);
        } else {
          console.debug('Request failed, retrying');
          await new Promise((r) => setTimeout(r, 2000 * (2 ^ retry)));
          retry++;
        }
      }
      rej(new GeniusApiError('Retries exceeded'));
    });
  }
}
