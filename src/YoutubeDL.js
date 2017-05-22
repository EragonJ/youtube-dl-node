import { execFile } from 'child_process';
import Base from './Base';

class YoutubeDL extends Base {
  constructor(props) {
    super(props);
  }

  _execCommand(binaryPath, args = []) {
    return new Promise((resolve, reject) => {
      let passedArgs = ['--dump-json'];
      let options = {
        maxBuffer: Infinity
      };

      if (args.indexOf('-f') < 0 && args.indexOf('--format') < 0) {
        passedArgs.push('-f');
        passedArgs.push('best');
      }

      passedArgs = passedArgs.concat(args);

      execFile(binaryPath, passedArgs, options, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        }
        else {
          let data = stdout.trim().split(/\r?\n/);
          let result;

          try {
            result = data.map((rawData) => {
              return JSON.parse(rawData);
            })
          }
          catch(err) {
            return reject(err);
          }

          return resolve(result.length === 1 ? result[0] : result);
        }
      });
    });
  }

  getInfo(url, args = []) {
    const binaryPath = this._getYtdlBinaryPath();
    args.push(url);
    return this._execCommand(binaryPath, args);
  }
}

export default YoutubeDL;
