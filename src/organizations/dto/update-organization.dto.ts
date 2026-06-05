import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['CLASS_TREASURER', 'COMMUNITY_TREASURER', 'RT_TREASURER', 'STUDY_GROUP_TREASURER', 'OTHER'])
  type?: 'CLASS_TREASURER' | 'COMMUNITY_TREASURER' | 'RT_TREASURER' | 'STUDY_GROUP_TREASURER' | 'OTHER';
}
