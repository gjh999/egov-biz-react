import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { codeApi } from '../api/biz'
import { useAsync } from '../hooks/useAsync'
import { useI18n } from '../i18n/I18nContext'
import { EmptyState, ErrorMessage, Loading } from '../components/Feedback'
import { Pagination } from '../components/Pagination'

/**
 * 공통코드 관리 (ROLE_ADMIN 전용).
 *
 * 왼쪽에서 코드를 고르면 오른쪽에 그 코드의 상세코드가 나온다.
 * 업무 화면의 셀렉트 박스 값이 여기서 나오므로, 상세코드를 지우면 이미 그 값을 쓰던 데이터의
 * 표시가 코드값 그대로 노출된다 — 삭제보다 사용여부('N') 변경을 권한다.
 */
export function CodeManagePage() {
  const { t } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const pageIndex = Number(searchParams.get('page') ?? '1')

  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null)

  const codes = useAsync(() => codeApi.list({ pageIndex }), [pageIndex])
  const details = useAsync(
    () => (selectedCodeId ? codeApi.details(selectedCodeId) : Promise.resolve(null)),
    [selectedCodeId],
  )

  return (
    <>
      <h1 className="h3 mb-3">{t('nav.code', '공통코드 관리')}</h1>

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <section className="krds-panel h-100">
            <div className="krds-panel-head">
              <h2 className="h5 mb-0">{t('code.list', '코드')}</h2>
            </div>
            <div className="krds-panel-body">
              {codes.loading && <Loading />}
              {codes.error && <ErrorMessage message={codes.error} onRetry={codes.reload} />}

              {!codes.loading && !codes.error && (
                <>
                  {(codes.data?.resultList?.length ?? 0) === 0 ? (
                    <EmptyState />
                  ) : (
                    <div className="krds-table-wrap">
                      <table className="tbl">
                        <caption>{t('code.listCaption', '코드 목록 — 코드ID, 코드명, 사용여부')}</caption>
                        <colgroup>
                          <col style={{ width: '30%' }} />
                          <col />
                          <col style={{ width: '15%' }} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th scope="col">{t('code.id', '코드ID')}</th>
                            <th scope="col">{t('code.name', '코드명')}</th>
                            <th scope="col">{t('bbsMaster.use', '사용')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {codes.data?.resultList?.map((code) => (
                            <tr
                              key={code.codeId}
                              className={selectedCodeId === code.codeId ? 'table-active' : undefined}
                            >
                              <td>
                                <button
                                  type="button"
                                  className="btn-link p-0 border-0 bg-transparent"
                                  aria-pressed={selectedCodeId === code.codeId}
                                  onClick={() => setSelectedCodeId(code.codeId)}
                                >
                                  {code.codeId}
                                </button>
                              </td>
                              <td className="text-start">{code.codeIdNm}</td>
                              <td>
                                <span className={`krds-badge ${code.useAt === 'Y' ? 'bg-primary' : 'bg-gray'}`}>
                                  {code.useAt === 'Y' ? t('com.yes', '사용') : t('com.no', '미사용')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {codes.data?.paginationInfo && (
                    <Pagination
                      info={codes.data.paginationInfo}
                      onChange={(pageNo) => setSearchParams({ page: String(pageNo) })}
                    />
                  )}
                </>
              )}
            </div>
          </section>
        </div>

        <div className="col-12 col-lg-6">
          <section className="krds-panel h-100">
            <div className="krds-panel-head">
              <h2 className="h5 mb-0">
                {t('code.detailList', '상세코드')}
                {selectedCodeId && <span className="ms-2 small text-muted">({selectedCodeId})</span>}
              </h2>
            </div>
            <div className="krds-panel-body">
              {!selectedCodeId ? (
                <EmptyState>{t('code.selectFirst', '왼쪽에서 코드를 선택하세요.')}</EmptyState>
              ) : details.loading ? (
                <Loading />
              ) : details.error ? (
                <ErrorMessage message={details.error} onRetry={details.reload} />
              ) : (details.data?.resultList?.length ?? 0) === 0 ? (
                <EmptyState />
              ) : (
                <div className="krds-table-wrap">
                  <table className="tbl">
                    <caption>{t('code.detailCaption', '상세코드 목록 — 코드, 코드명, 사용여부')}</caption>
                    <colgroup>
                      <col style={{ width: '25%' }} />
                      <col />
                      <col style={{ width: '15%' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th scope="col">{t('code.code', '코드')}</th>
                        <th scope="col">{t('code.name', '코드명')}</th>
                        <th scope="col">{t('bbsMaster.use', '사용')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.data?.resultList?.map((detail) => (
                        <tr key={`${detail.codeId}-${detail.code}`}>
                          <td>{detail.code}</td>
                          <td className="text-start">{detail.codeNm}</td>
                          <td>
                            <span className={`krds-badge ${detail.useAt === 'Y' ? 'bg-primary' : 'bg-gray'}`}>
                              {detail.useAt === 'Y' ? t('com.yes', '사용') : t('com.no', '미사용')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
