export interface Chat {
  id: number;
  createdAt: string;
  title: string;
  // chatMembers는 @JsonManagedReference이므로 포함될 수 있음
}
