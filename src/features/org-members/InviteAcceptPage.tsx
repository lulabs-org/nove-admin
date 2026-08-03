import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Card from 'antd/es/card';
import Button from 'antd/es/button';
import Spin from 'antd/es/spin';
import Result from 'antd/es/result';
import { orgMemberApi } from './api/orgMemberApi';

type PageState = 'loading' | 'success' | 'error';

export function InviteAcceptPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const memberId = params.get('memberId');
  const token = params.get('token');
  const hasParams = Boolean(memberId && token);

  const [state, setState] = useState<PageState>(hasParams ? 'loading' : 'error');
  const [errorMsg, setErrorMsg] = useState(
    hasParams ? '邀请链接无效或已过期。' : '邀请链接缺少必要参数。'
  );

  useEffect(() => {
    if (!hasParams) return;

    let cancelled = false;
    (async () => {
      try {
        await orgMemberApi.acceptInvitation(memberId!, token!);
        if (!cancelled) setState('success');
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : '邀请链接无效或已过期。';
        setErrorMsg(msg);
        setState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [memberId, token, hasParams]);

  if (state === 'loading') {
    return (
      <Card style={{ textAlign: 'center', padding: 40 }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, color: '#666' }}>正在接受邀请…</p>
      </Card>
    );
  }

  if (state === 'success') {
    return (
      <Card>
        <Result
          status="success"
          title="邀请已接受"
          subTitle="您已成功加入组织，请使用邮箱验证码登录系统。"
          extra={
            <Button type="primary" onClick={() => navigate('/login')}>
              前往登录
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      <Result
        status="error"
        title="接受邀请失败"
        subTitle={errorMsg}
        extra={
          <Button type="primary" onClick={() => navigate('/login')}>
            返回登录
          </Button>
        }
      />
    </Card>
  );
}
