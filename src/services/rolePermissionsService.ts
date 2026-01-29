import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { ALL_PERMISSION_IDS, PermissionId } from '../types/permissions';

const CONFIG_DOC_ID = 'rolePermissions';

export interface RolePermissionsConfig {
  leader: string[];
  participant: string[];
}

export async function getRolePermissions(): Promise<RolePermissionsConfig> {
  const ref = doc(db, 'config', CONFIG_DOC_ID);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return {
      leader: [...ALL_PERMISSION_IDS],
      participant: [...ALL_PERMISSION_IDS],
    };
  }
  const data = snap.data();
  const leader = Array.isArray(data?.leader) ? data.leader : [...ALL_PERMISSION_IDS];
  const participant = Array.isArray(data?.participant)
    ? data.participant
    : [...ALL_PERMISSION_IDS];
  return { leader, participant };
}

export async function setRolePermissions(
  data: RolePermissionsConfig
): Promise<void> {
  const ref = doc(db, 'config', CONFIG_DOC_ID);
  await setDoc(ref, {
    leader: data.leader,
    participant: data.participant,
    updatedAt: new Date().toISOString(),
  });
}
