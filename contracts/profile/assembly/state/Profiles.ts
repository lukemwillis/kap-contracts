import { Storage } from '@koinos/sdk-as';
import { profile } from '../proto/profile';

const PROFILES_SPACE_ID = 1;

export class Profiles extends Storage.Map<Uint8Array, profile.profile_object> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      PROFILES_SPACE_ID,
      profile.profile_object.decode,
      profile.profile_object.encode,
      () => new profile.profile_object()
    );
  }
}
