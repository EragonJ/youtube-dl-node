import path from 'path';
import fs from 'fs';
import request from 'request';
import rp from 'request-promise';
import Base from './Base';

class Downloader extends Base {
  constructor(props) {
    super(props);
    this._url = 'https://ytdl-org.github.io/youtube-dl/download.html';
    this._regex = /https:\/\/yt-dl\.org\/downloads\/(.*?)\/youtube-dl/;
  }

  _getLatestInfo() {
    return rp.get(this._url).then((html) => {
      let result = html.match(this._regex);
      if (result) {
        return result;
      }
      else {
        return Promise.reject('Can\'t find the binary url or version');
      }
    })
  }

  _checkVersion() {
    return this._getLocalVersion().then((localVersion) => {
      return this._getLatestInfo().then((info) => {
        const [url, version] = info;
        return Promise.resolve([version !== localVersion, url, version]);
      });
    });
  }

  _getLocalVersion() {
    return new Promise((resolve, reject) => {
      const fullPath = this._getVersionFilePath();
      fs.readFile(fullPath, 'utf8', (error, data) => {
        if (error) {
          if (error.code === 'ENOENT') {
            resolve('__FIRST_TIME_DOWNLOAD_SO_NO_VERSION__');
          }
          else {
            reject(error);
          }
        }
        else {
          resolve(data);
        }
      });
    });
  }

  _writeLocalVersion(version = '') {
    return new Promise((resolve, reject) => {
      const fullPath = this._getVersionFilePath();
      fs.writeFile(fullPath, version, (error) => {
        if (error) {
          reject(error);
        }
        else {
          resolve();
        }
      });
    });
  }

  _writeYtdlFile(url, os) {
    if (!url) {
      return Promise.reject('no url');
    }

    let to = this._getYtdlBinaryPath();
    if (os === 'win') {
      url += '.exe';
      to += '.exe';
    }

    return new Promise((resolve, reject) => {
      let foundError;
      let downloadStream = request.get(url);

      downloadStream.on('response', (res) => {
        if (res.statusCode !== 200) {
          foundError = `Response Error: ${res.statusCode}`;
          return;
        }

        downloadStream.pipe(fs.createWriteStream(to, {
          mode: 0o755
        }));
      });

      downloadStream.on('error', (error) => {
        reject(error);
      });

      downloadStream.on('end', () => {
        if (foundError) {
          reject(foundError);
        }
        else {
          resolve();
        }
      });
    });
  }

  _normalizeOS(os) {
    if (os === 'win32') {
      return 'win';
    }
    else {
      return 'default';
    }
  }

  save(os, force=false) {
    return this._checkVersion().then((result) => {
      os = this._normalizeOS(os);
      let [isNewer, url, version] = result;

      if (isNewer || force) {
        return this._writeLocalVersion(version).then(() => {
          return this._writeYtdlFile(url, os);
        })
      }
      else {
        return Promise.resolve();
      }
    });
  }
}

export default Downloader;
