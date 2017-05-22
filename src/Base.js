import path from 'path';

class Base {
  constructor(props) {
    this._saveToPath = '.';
    this._ytdlFileName = 'youtube-dl';
    this._versionFileName = 'VERSION';
  }

  setPath(userPath) {
    this._saveToPath = path.normalize(userPath);
  }

  _getVersionFilePath() {
    return path.join(this._saveToPath, this._versionFileName);
  }

  _getYtdlBinaryPath() {
    return path.join(this._saveToPath, this._ytdlFileName);
  }
}

export default Base;
