import { useState } from "react";

const avatarAlt = "Foto de perfil de Caíque Rezende";
const avatarUrl = "/profile/caique-rezende.png";

export function ProfilePortrait() {
  const [failed, setFailed] = useState(false);

  return (
    <div className="profile-portrait">
      {failed ? (
        <span className="portrait-fallback" role="img" aria-label={avatarAlt}>
          <span aria-hidden="true">CR</span>
        </span>
      ) : (
        <img
          src={avatarUrl}
          alt={avatarAlt}
          width="460"
          height="460"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
