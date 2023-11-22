export class UpdatePostDTO {
  postID: string;
  condition: string;
  title: string;
  description: string;
  manufactor: string;
  color: string;
  image_path: string;
  status: string;
  isReview: boolean;
  totalPrice: number;
  createdAt: Date;
  expiredAt: Date;
  updatedAt: Date;
  detailsPost: Object;
}
