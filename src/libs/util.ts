import * as fs from 'fs';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

export class Util {
  static compareDate(date1: Date, date2: Date) {
    return date1.getTime() - date2.getTime();
  }
  static readFilesFromFolder(path: string) {
    if (!fs.existsSync(path)) {
      console.log('Folder does not exist');
      return [];
      // fs.mkdirSync(path);
    }
    return fs.readdirSync(path);
  }
  static isFolderExists(path: string) {
    return fs.existsSync(path);
  }
  static deleteFile(path: string) {
    fs.access(path, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(path, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });
      }
    });
  }
  static comparePassword(
    plainPassword: string,
    encryptedPassword: string,
  ): boolean {
    return bcrypt.compareSync(plainPassword, encryptedPassword);
  }
  static GenerateToken(user: any, expiresIn: string | number = '1h') {
    return jwt.sign(user, process.env['JWT_SECRET'] || '', {
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  static GenerateRefreshToken(user: any, expiresIn: string | number = '1d') {
    return jwt.sign(user, process.env['REFRESH_SECRET_TOKEN'] || '', {
      expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    });
  }
  static hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }
  static formatNumber(num: number | string) {
    if (!num) {
      return '';
    }
    if (typeof num === 'string') num = parseFloat(num);
    return num.toLocaleString('en-US');
  }

  static formatDateWithDayName(date: Date) {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }
}
