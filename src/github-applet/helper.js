import { Observable } from 'rxjs/Rx';
import $ from 'jquery';
import { TOKEN } from './constValue';

const SEARCH_REPOS =
  'https://api.github.com/search/repositories?sort=stars&order=desc&q=';
const KB2MB = 0.0009765625;
const KB2BYTES = 1024;

const formatRepoSize = repoSize => parseInt(repoSize).toFixed(2);

export const formatRepoSizeAndUnit = repoSize => {
  if (repoSize < 1) {
    return [formatRepoSize(repoSize * KB2BYTES), 'Bytes'];
  }
  if (repoSize >= 1 / KB2MB) {
    return [formatRepoSize(repoSize * KB2MB), 'MB'];
  }
  return [repoSize, 'KB'];
};

/**
 * リポジトリ一覧を取得する
 * @param {*} query
 * @return {Promise}
 */
const fetchRepositories = query => {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'GET',
      url: `${SEARCH_REPOS}${query}`,
      success: data => {
        resolve(data.items);
      },
      error: err => {
        console.log(err);
        resolve([]);
      },
    });
  });
};

/**
 * ユーザー情報を取得する
 * @param {*} data
 * @return {Promise}
 */
const fetchUser = data => {
  const { url, conatiner } = data;

  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'GET',
      url: `${url}?access_token=${TOKEN}`,
      success: data => {
        resolve({
          conatiner,
          data,
        });
      },
      error: err => {
        console.log(err);
        reject(null);
      },
    });
  });
};

/**
 * queryをもとに検索したリポジトリ一覧を返すPromiseをObservableに変換して返す
 * @param {string} query
 */
export const fetchRepositories$ = query => {
  const promise = fetchRepositories(query);

  return Observable.fromPromise(promise);
};

export const fetchUser$ = data => {
  const promise = fetchUser(data);

  return Observable.fromPromise(promise);
};
