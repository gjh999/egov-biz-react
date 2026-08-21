import { AdminCrudPage } from '../../components/AdminCrudPage'
import { useI18n } from '../../i18n/I18nContext'
import { adminApi, codeApi, logApi, userApi } from '../../api/biz'
import type {
  CommonClassCode,
  CommonCode,
  LoginLog,
  LoginPolicy,
  MemberListItem,
  MenuItem,
  ProgramItem,
  SysLog,
  UserAbsence,
} from '../../api/types'

/**
 * 기업 업무 템플릿 전용 관리자 화면.
 *
 * 포털에 없는 운영 관리 기능들이다 — 업무사용자·공통코드·메뉴·프로그램·부재·접속정책·로그.
 * 공통 골격(`AdminCrudPage`) 위에 컬럼·필드·API 세 가지만 지정한다.
 */

/** 사용여부 셀렉트 — 여러 화면이 같은 선택지를 쓴다 */
function useAtField(t: (k: string, f?: string) => string) {
  return {
    name: 'useAt',
    label: t('bbsMaster.use', '사용여부'),
    type: 'select' as const,
    options: [
      { value: 'Y', label: t('com.yes', '사용') },
      { value: 'N', label: t('com.no', '미사용') },
    ],
  }
}

// ---------------------------------------------------------------- 업무사용자

export function UserAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<MemberListItem>
      title={t('nav.user', '업무사용자 관리')}
      caption={t('user.listCaption', '업무사용자 목록 — 아이디, 이름, 이메일, 상태')}
      rowKey={(row) => row.uniqId ?? row.emplyrId ?? ''}
      columns={[
        { header: t('login.id', '아이디'), width: '20%', cell: (row) => row.emplyrId ?? '-' },
        { header: t('mypage.name', '이름'), width: '20%', cell: (row) => row.emplyrNm ?? row.userNm ?? '-' },
        { header: t('mypage.email', '이메일'), alignStart: true, cell: (row) => row.emailAdres ?? '-' },
        { header: t('member.status', '상태'), width: '12%', cell: (row) => row.emplyrSttusCode ?? '-' },
      ]}
      fields={[
        { name: 'emplyrId', label: t('login.id', '아이디'), required: true, readOnlyOnEdit: true },
        { name: 'emplyrNm', label: t('mypage.name', '이름'), required: true },
        { name: 'emailAdres', label: t('mypage.email', '이메일') },
        { name: 'moblphonNo', label: t('member.phone', '휴대전화') },
        { name: 'ofcpsNm', label: t('user.position', '직위') },
        {
          name: 'emplyrSttusCode',
          label: t('member.status', '상태'),
          type: 'select',
          options: [
            { value: 'P', label: t('member.statusNormal', '정상') },
            { value: 'A', label: t('member.statusWaiting', '가입신청') },
            { value: 'D', label: t('member.statusLeft', '삭제') },
          ],
        },
      ]}
      toFormValues={(row) => ({
        emplyrId: row.emplyrId ?? '',
        emplyrNm: row.emplyrNm ?? row.userNm ?? '',
        emailAdres: row.emailAdres ?? '',
        moblphonNo: '',
        ofcpsNm: '',
        emplyrSttusCode: row.emplyrSttusCode ?? 'P',
      })}
      fetchList={(pageIndex, keyword) => userApi.list({ pageIndex, searchKeyword: keyword })}
      onCreate={(v) => userApi.create(v)}
      onUpdate={(row, v) => userApi.update(row.emplyrId ?? '', v)}
      onDelete={(row) => userApi.remove(row.emplyrId ?? '')}
      searchPlaceholder={t('user.searchPlaceholder', '이름을 입력하세요')}
    />
  )
}

// ---------------------------------------------------------------- 공통코드

export function CodeClassAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<CommonClassCode>
      title={t('nav.codeClass', '공통코드 분류 관리')}
      caption={t('codeClass.listCaption', '분류코드 목록 — 분류코드, 분류명, 설명, 사용여부')}
      rowKey={(row) => row.clCode}
      columns={[
        { header: t('codeClass.code', '분류코드'), width: '20%', cell: (row) => row.clCode },
        { header: t('codeClass.name', '분류명'), width: '25%', cell: (row) => row.clCodeNm },
        { header: t('com.desc', '설명'), alignStart: true, cell: (row) => row.clCodeDc ?? '-' },
        {
          header: t('bbsMaster.use', '사용'),
          width: '10%',
          cell: (row) => (
            <span className={`krds-badge ${row.useAt === 'Y' ? 'bg-primary' : 'bg-gray'}`}>
              {row.useAt === 'Y' ? t('com.yes', '사용') : t('com.no', '미사용')}
            </span>
          ),
        },
      ]}
      fields={[
        { name: 'clCode', label: t('codeClass.code', '분류코드'), required: true, readOnlyOnEdit: true },
        { name: 'clCodeNm', label: t('codeClass.name', '분류명'), required: true },
        { name: 'clCodeDc', label: t('com.desc', '설명'), type: 'textarea' },
        useAtField(t),
      ]}
      toFormValues={(row) => ({
        clCode: row.clCode,
        clCodeNm: row.clCodeNm ?? '',
        clCodeDc: row.clCodeDc ?? '',
        useAt: row.useAt ?? 'Y',
      })}
      fetchList={(pageIndex) => codeApi.classList({ pageIndex })}
      onCreate={(v) => codeApi.createClass(v)}
      onUpdate={(row, v) => codeApi.updateClass(row.clCode, v)}
      onDelete={(row) => codeApi.removeClass(row.clCode)}
      searchable={false}
    />
  )
}

export function CodeAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<CommonCode>
      title={t('nav.code', '공통코드 관리')}
      caption={t('code.listCaption', '코드 목록 — 코드ID, 코드명, 분류, 사용여부')}
      rowKey={(row) => row.codeId}
      columns={[
        { header: t('code.id', '코드ID'), width: '20%', cell: (row) => row.codeId },
        { header: t('code.name', '코드명'), width: '25%', cell: (row) => row.codeIdNm },
        { header: t('codeClass.code', '분류'), width: '15%', cell: (row) => row.clCode ?? '-' },
        { header: t('com.desc', '설명'), alignStart: true, cell: (row) => row.codeIdDc ?? '-' },
        {
          header: t('bbsMaster.use', '사용'),
          width: '10%',
          cell: (row) => (
            <span className={`krds-badge ${row.useAt === 'Y' ? 'bg-primary' : 'bg-gray'}`}>
              {row.useAt === 'Y' ? t('com.yes', '사용') : t('com.no', '미사용')}
            </span>
          ),
        },
      ]}
      fields={[
        { name: 'codeId', label: t('code.id', '코드ID'), required: true, readOnlyOnEdit: true },
        { name: 'codeIdNm', label: t('code.name', '코드명'), required: true },
        {
          name: 'clCode',
          label: t('codeClass.code', '분류코드'),
          hint: t('code.classHint', '분류코드 관리 화면에 등록된 값이어야 합니다.'),
        },
        { name: 'codeIdDc', label: t('com.desc', '설명'), type: 'textarea' },
        useAtField(t),
      ]}
      toFormValues={(row) => ({
        codeId: row.codeId,
        codeIdNm: row.codeIdNm ?? '',
        clCode: row.clCode ?? '',
        codeIdDc: row.codeIdDc ?? '',
        useAt: row.useAt ?? 'Y',
      })}
      fetchList={(pageIndex, keyword) => codeApi.list({ pageIndex, searchKeyword: keyword })}
      onCreate={(v) => codeApi.create(v)}
      onUpdate={(row, v) => codeApi.update(row.codeId, v)}
      onDelete={(row) => codeApi.remove(row.codeId)}
      searchPlaceholder={t('code.searchPlaceholder', '코드명을 입력하세요')}
    />
  )
}

// ---------------------------------------------------------------- 메뉴 · 프로그램

export function MenuAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<MenuItem>
      title={t('nav.menuManage', '메뉴 관리')}
      caption={t('menu.listCaption', '메뉴 목록 — 메뉴번호, 메뉴명, 상위메뉴, 순서, 연결 프로그램')}
      rowKey={(row) => String(row.menuNo)}
      columns={[
        { header: t('menu.no', '메뉴번호'), width: '12%', cell: (row) => row.menuNo },
        { header: t('menu.name', '메뉴명'), width: '22%', cell: (row) => row.menuNm },
        { header: t('menu.upper', '상위메뉴'), width: '12%', cell: (row) => row.upperMenuId ?? '-' },
        { header: t('menu.order', '순서'), width: '10%', cell: (row) => row.menuOrdr ?? '-' },
        { header: t('menu.program', '연결 프로그램'), alignStart: true, cell: (row) => row.progrmFileNm ?? '-' },
      ]}
      fields={[
        { name: 'menuNo', label: t('menu.no', '메뉴번호'), type: 'number', required: true, readOnlyOnEdit: true },
        { name: 'menuNm', label: t('menu.name', '메뉴명'), required: true },
        {
          name: 'upperMenuId',
          label: t('menu.upper', '상위메뉴 번호'),
          hint: t('menu.upperHint', '최상위 메뉴는 0 을 입력합니다.'),
        },
        { name: 'menuOrdr', label: t('menu.order', '정렬순서'), type: 'number' },
        { name: 'progrmFileNm', label: t('menu.program', '연결 프로그램 파일명') },
        { name: 'menuDc', label: t('com.desc', '설명'), type: 'textarea' },
      ]}
      toFormValues={(row) => ({
        menuNo: String(row.menuNo ?? ''),
        menuNm: row.menuNm ?? '',
        upperMenuId: row.upperMenuId ?? '',
        menuOrdr: String(row.menuOrdr ?? ''),
        progrmFileNm: row.progrmFileNm ?? '',
        menuDc: row.menuDc ?? '',
      })}
      fetchList={(pageIndex) => adminApi.menuList({ pageIndex })}
      onCreate={(v) => adminApi.createMenu(v)}
      onUpdate={(row, v) => adminApi.updateMenu(row.menuNo, v)}
      onDelete={(row) => adminApi.removeMenu(String(row.menuNo))}
      searchable={false}
    />
  )
}

export function ProgramAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<ProgramItem>
      title={t('nav.programManage', '프로그램 관리')}
      caption={t('program.listCaption', '프로그램 목록 — 파일명, 한글명, 저장경로, 설명')}
      rowKey={(row) => row.progrmFileNm}
      columns={[
        { header: t('program.file', '파일명'), width: '25%', cell: (row) => row.progrmFileNm },
        { header: t('program.name', '한글명'), width: '22%', cell: (row) => row.progrmKoreanNm ?? '-' },
        { header: t('program.path', '저장경로'), alignStart: true, cell: (row) => row.progrmStreNm ?? '-' },
      ]}
      fields={[
        { name: 'progrmFileNm', label: t('program.file', '파일명'), required: true, readOnlyOnEdit: true },
        { name: 'progrmKoreanNm', label: t('program.name', '한글명'), required: true },
        { name: 'progrmStreNm', label: t('program.path', '저장경로') },
        { name: 'url', label: t('program.url', 'URL') },
        { name: 'progrmDc', label: t('com.desc', '설명'), type: 'textarea' },
      ]}
      toFormValues={(row) => ({
        progrmFileNm: row.progrmFileNm,
        progrmKoreanNm: row.progrmKoreanNm ?? '',
        progrmStreNm: row.progrmStreNm ?? '',
        url: row.url ?? '',
        progrmDc: row.progrmDc ?? '',
      })}
      fetchList={(pageIndex) => adminApi.programList({ pageIndex })}
      onCreate={(v) => adminApi.createProgram(v)}
      onUpdate={(row, v) => adminApi.updateProgram(row.progrmFileNm, v)}
      onDelete={(row) => adminApi.removeProgram(row.progrmFileNm)}
      searchable={false}
    />
  )
}

// ---------------------------------------------------------------- 부재 · 접속정책

export function AbsenceAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<UserAbsence>
      title={t('nav.absence', '사용자 부재 관리')}
      caption={t('absence.listCaption', '부재 목록 — 사용자, 시작일, 종료일, 사유')}
      rowKey={(row) => row.userId}
      columns={[
        { header: t('login.id', '아이디'), width: '18%', cell: (row) => row.userId },
        { header: t('mypage.name', '이름'), width: '15%', cell: (row) => row.userNm ?? '-' },
        { header: t('absence.begin', '시작일'), width: '15%', cell: (row) => row.absnceBgnde ?? '-' },
        { header: t('absence.end', '종료일'), width: '15%', cell: (row) => row.absnceEndde ?? '-' },
        { header: t('absence.reason', '사유'), alignStart: true, cell: (row) => row.absnceDc ?? '-' },
      ]}
      fields={[
        { name: 'userId', label: t('login.id', '사용자 아이디'), required: true, readOnlyOnEdit: true },
        { name: 'absnceBgnde', label: t('absence.begin', '시작일'), type: 'date', required: true },
        { name: 'absnceEndde', label: t('absence.end', '종료일'), type: 'date', required: true },
        { name: 'absnceDc', label: t('absence.reason', '사유'), type: 'textarea' },
      ]}
      toFormValues={(row) => ({
        userId: row.userId,
        absnceBgnde: row.absnceBgnde ?? '',
        absnceEndde: row.absnceEndde ?? '',
        absnceDc: row.absnceDc ?? '',
      })}
      fetchList={(pageIndex) => adminApi.absenceList({ pageIndex })}
      onCreate={(v) => adminApi.createAbsence(v)}
      onUpdate={(row, v) => adminApi.updateAbsence(row.userId, v)}
      onDelete={(row) => adminApi.removeAbsence(row.userId)}
      searchable={false}
    />
  )
}

export function LoginPolicyAdminPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<LoginPolicy>
      title={t('nav.loginPolicy', '로그인 접속정책')}
      caption={t('loginPolicy.listCaption', '접속정책 목록 — 사용자, 허용 IP, 부서, 중복접속')}
      rowKey={(row) => row.emplyrId}
      columns={[
        { header: t('login.id', '아이디'), width: '18%', cell: (row) => row.emplyrId },
        { header: t('mypage.name', '이름'), width: '15%', cell: (row) => row.userNm ?? '-' },
        { header: t('loginPolicy.ip', '허용 IP'), alignStart: true, cell: (row) => row.ipInfo ?? '-' },
        { header: t('loginPolicy.dept', '부서'), width: '15%', cell: (row) => row.deptNm ?? '-' },
      ]}
      fields={[
        { name: 'emplyrId', label: t('login.id', '사용자 아이디'), required: true, readOnlyOnEdit: true },
        {
          name: 'ipInfo',
          label: t('loginPolicy.ip', '허용 IP'),
          hint: t('loginPolicy.ipHint', '이 IP 에서만 로그인할 수 있습니다. 비우면 제한하지 않습니다.'),
        },
        {
          name: 'dplctPermAt',
          label: t('loginPolicy.duplicate', '중복접속 허용'),
          type: 'select',
          options: [
            { value: 'Y', label: t('com.yes', '허용') },
            { value: 'N', label: t('com.no', '차단') },
          ],
        },
      ]}
      toFormValues={(row) => ({
        emplyrId: row.emplyrId,
        ipInfo: row.ipInfo ?? '',
        dplctPermAt: row.dplctPermAt ?? 'Y',
      })}
      fetchList={(pageIndex) => adminApi.loginPolicyList({ pageIndex })}
      onCreate={(v) => adminApi.createLoginPolicy(v)}
      onUpdate={(row, v) => adminApi.updateLoginPolicy(row.emplyrId, v)}
      onDelete={(row) => adminApi.removeLoginPolicy(row.emplyrId)}
      searchable={false}
    />
  )
}

// ---------------------------------------------------------------- 로그 조회

/**
 * 로그 조회 화면들.
 * 등록·수정·삭제 핸들러를 넘기지 않아 <b>조회 전용</b>이 된다 — 감사 추적 대상이라
 * 화면에서 고칠 수 있으면 안 되기 때문이다.
 */
export function LoginLogPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<LoginLog>
      title={t('nav.loginLog', '로그인 로그')}
      caption={t('loginLog.listCaption', '로그인 로그 — 일시, 아이디, 이름, IP, 결과')}
      rowKey={(row) => row.logId}
      columns={[
        { header: t('loginLog.date', '일시'), width: '20%', cell: (row) => row.creatDt ?? '-' },
        { header: t('login.id', '아이디'), width: '15%', cell: (row) => row.loginId },
        { header: t('mypage.name', '이름'), width: '15%', cell: (row) => row.loginNm ?? '-' },
        { header: t('loginLog.ip', 'IP'), width: '18%', cell: (row) => row.loginIp ?? '-' },
        {
          header: t('loginLog.result', '결과'),
          alignStart: true,
          cell: (row) => (
            <span className={`krds-badge ${row.errOccrrAt === 'Y' ? 'bg-gray' : 'bg-primary'}`}>
              {row.errOccrrAt === 'Y' ? t('loginLog.fail', '실패') : t('loginLog.success', '성공')}
            </span>
          ),
        },
      ]}
      fetchList={(pageIndex) => logApi.loginLogList({ pageIndex })}
      searchable={false}
    />
  )
}

export function SysLogPage() {
  const { t } = useI18n()
  return (
    <AdminCrudPage<SysLog>
      title={t('nav.sysLog', '시스템 로그')}
      caption={t('sysLog.listCaption', '시스템 로그 — 발생일, 요청자, 업무, 처리, 오류')}
      rowKey={(row) => row.requstId}
      columns={[
        { header: t('sysLog.date', '발생일'), width: '15%', cell: (row) => row.occrrncDe ?? '-' },
        { header: t('sysLog.requester', '요청자'), width: '15%', cell: (row) => row.rqsterNm ?? row.rqesterId ?? '-' },
        { header: t('sysLog.job', '업무'), width: '15%', cell: (row) => row.jobSeCodeNm ?? row.jobSeCode ?? '-' },
        { header: t('sysLog.method', '메서드'), alignStart: true, cell: (row) => row.methodNm ?? '-' },
        {
          header: t('sysLog.error', '오류'),
          width: '12%',
          cell: (row) =>
            row.errorCode ? (
              <span className="krds-badge bg-gray">{row.errorCode}</span>
            ) : (
              <span className="krds-badge bg-primary">{t('sysLog.normal', '정상')}</span>
            ),
        },
      ]}
      fetchList={(pageIndex) => logApi.sysLogList({ pageIndex })}
      searchable={false}
    />
  )
}
