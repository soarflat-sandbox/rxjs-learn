import { Observable } from 'rxjs/Rx';
import $ from 'jquery';

import { getRepos, getUser } from './helper';
import { reposTemplate, userTemplate } from './templates';

const showUserInfo = ($dom, data) => {
  $dom.html(userTemplate(data));
};

const userInfoSteam = $repos => {
  const $avator = $repos.find('.user_header');
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
    .switchMap(getUser)
    .do(result => {
      const { data, conatiner } = result;

      showUserInfo(conatiner, data);
    });

  return avatorMouseover$;
};

$(() => {
  const $conatiner = $('.content_container');
  const $input = $('.search');

  const input$ = Observable.fromEvent($input, 'keyup')
    .debounceTime(400)
    .map(() => $input.val().trim())
    .filter(text => !!text)
    .distinctUntilChanged()
    .switchMap(getRepos)
    .do(results => $conatiner.html(''))
    .flatMap(results => Observable.from(results))
    .map(repos => $(reposTemplate(repos)))
    .do($repos => {
      $conatiner.append($repos);
    })
    .flatMap($repos => {
      return userInfoSteam($repos);
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
