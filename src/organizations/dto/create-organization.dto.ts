import { IsIn, IsString } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  name: string;

  @IsIn(['CLASS_TREASURER', 'COMMUNITY_TREASURER', 'RT_TREASURER', 'STUDY_GROUP_TREASURER', 'OTHER'])
  type: 'CLASS_TREASURER' | 'COMMUNITY_TREASURER' | 'RT_TREASURER' | 'STUDY_GROUP_TREASURER' | 'OTHER';

  @IsString()
  ownerId: string;
}
