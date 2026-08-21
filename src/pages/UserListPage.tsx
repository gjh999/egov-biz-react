import { useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { userApi } from '../api/biz'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/I18nContext'
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback'
import { Pagination } from '../components/Pagination'

/**
 * 업무사용자(직원) 관리 (ROLE_ADMIN 전용).
 *
 * 일반회원(외부 개인)과는 저장 테이블이 다르다 — 회원관리 화면과 별도로 둔 이유다.
 */
export function UserListPage() {
  const { t } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()

  const pageIndex = Number(searchParams.get('page') ?? '1')
  const searchCondition = searchParams.get('cnd') ?? '0'
  const searchKeyword = searchParams.get('wrd') ?? ''

  const [condition, setCondition] = useState(searchCondition)
  const [keyword, setKeyword] = useState(searchKeyword)

  const { data, loading, error, reload } = useAsync(
    () => userApi.list({ pageIndex, searchCondition, searchKeyword }),
    [pageIndex, searchCondition, searchKeyword],
  )

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    setSearchParams({ page: '1', cnd: condition, wrd: keyword })
  }

  const users = data?.resultList ?? []

  return (
    <>
      <h1 className="h3 mb-3">{t('nav.user', '업무사용자 관리')}</h1>

      <form className="d-flex gap-2 mb-3" onSubmit={handleSearch} role="search">
        <label className="visually-hidden" htmlFor="user-condition">
          {t('member.searchCondition', '검색 조건')}
        </label>
        <select
          id="user-condition"
          className="krds-form-select"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          <option value="0">{t('mypage.name', '이름')}</option>
          <option value="1">{t('login.id', '아이디')}</option>
        </select>

        <label className="visually-hidden" htmlFor="user-keyword">
          {t('bbs.searchKeyword', '검색어')}
        </label>
        <input
          id="user-keyword"
          className="krds-input"
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t('bbs.searchPlaceholder', '검색어를 입력하세요')}
        />

        <button type="submit" className="krds-btn secondary flex-shrink-0">
          {t('com.search', '검색')}
        </button>
      </form>

      {loading && <Loading />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {!loading && !error && (
        <>
          {users.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="krds-table-wrap">
              <table className="tbl">
                <caption>{t('user.listCaption', '업무사용자 목록 — 아이디, 이름, 이메일, 상태')}</caption>
                <colgroup>
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '20%' }} />
                  <col />
                  <col style={{ width: '15%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">{t('login.id', '아이디')}</th>
                    <th scope="col">{t('mypage.name', '이름')}</th>
                    <th scope="col">{t('mypage.email', '이메일')}</th>
                    <th scope="col">{t('member.status', '상태')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.uniqId ?? user.emplyrId}>
                      <td>{user.emplyrId ?? '-'}</td>
                      <td>{user.emplyrNm ?? user.userNm ?? '-'}</td>
                      <td className="text-start">{user.emailAdres ?? '-'}</td>
                      <td>{user.emplyrSttusCode ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data?.paginationInfo && (
            <Pagination
              info={data.paginationInfo}
              onChange={(pageNo) =>
                setSearchParams({ page: String(pageNo), cnd: searchCondition, wrd: searchKeyword })
              }
            />
          )}
        </>
      )}
    </>
  )
}
