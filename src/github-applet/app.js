import { Observable } from 'rxjs/Rx';
import $ from 'jquery';

import { fetchRepositories$, fetchUser$ } from './helper';
import { reposTemplate, userTemplate } from './templates';

const showUserInfo = ($dom, data) => {
  $dom.html(userTemplate(data));
};

/**
 * 検索したリポジトリのユーザー情報を表示するためのObservableを返す
 * @param {*} $repositories
 */
const userInfoSteam = $repositories => {
  const $avator = $repositories.find('.user_header');
  const avatorMouseover$ = Observable.fromEvent($avator, 'mouseover')
    .debounceTime(500)
    .takeWhile(e => {
      const $infosWrapper = $(e.target)
        .parent()
        .find('.user_infos_wrapper');

      return $infosWrapper.find('.infos_container').length === 0;
    })
    .map(e => {
      const $infosWrapper = $(e.target)
        .parent()
        .find('.user_infos_wrapper');

      return { conatiner: $infosWrapper, url: $(e.target).attr('data-api') };
    })
    .filter(data => !!data.url)
    .switchMap(fetchUser$)
    .do(({ data, conatiner }) => {
      showUserInfo(conatiner, data);
    });

  return avatorMouseover$;
};

$(() => {
  const $conatiner = $('.content_container');
  const $input = $('.search');

  const input$ = Observable.fromEvent($input, 'keyup')
    // 最後に入力してから400ms後に次のoperatorへ
    .debounceTime(400)

    // 入力した値を次のoperatorへ
    .map(e => e.target.value.trim())

    // 入力した値が文字列だったら次のoperatorへ
    .filter(text => !!text)

    // 流れてきた値が以前入力した値と異なる場合、次のoperatorへ
    .distinctUntilChanged()

    // switchMapが実行される度に、それまでのfetchRepositories$は削除され
    // 新しいfetchRepositories$が生成されるため
    // 最後にfetchRepositories$からemitされた値のみが次のoperatorへ
    // 例えば「vue」と入力して検索（非同期通信）中の時に「react」と入力すれば
    // 「vue」の検索は中断され、「react」の検索結果のみが次のoperatorへ
    .switchMap(fetchRepositories$)

    // doはObservableに何も影響を与えないため、htmlを空にするだけである
    .do(() => $conatiner.html(''))

    // 検索結果をObservableに変換して次のoperatorへ
    .flatMap(results => Observable.from(results))

    // 検索結果をテンプレートにattachしたjQueryオブジェクトを次のoperatorへ
    .map(repositories => $(reposTemplate(repositories)))

    // jQueryオブジェクトappendして描画する
    .do($repositories => {
      $conatiner.append($repositories);
    })

    // jQueryオブジェクトを渡してObservableを生成する
    .flatMap($repositories => {
      return userInfoSteam($repositories);
    });

  input$.subscribe(
    () => {
      console.log('success');
    },
    err => {
      console.log(err);
    },
    () => {
      console.log('completed');
    }
  );
});
