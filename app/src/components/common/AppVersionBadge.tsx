import { APP_BUILD_TIME, getVersionDetails } from '@/config/appVersion';

export const AppVersionBadge: React.FC = () => {
  const title = APP_BUILD_TIME
    ? `Build ${getVersionDetails()} · ${APP_BUILD_TIME}`
    : `Build ${getVersionDetails()}`;

  return (
    <div className="app-version-badge" title={title} aria-label={title}>
      {getVersionDetails()}
    </div>
  );
};
