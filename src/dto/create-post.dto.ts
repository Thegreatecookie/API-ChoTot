export class CreatePostDTO {
  userID: string;
  categoryID: string;
  condition: string;
  title: string;
  description: string;
  manufactor: string;
  color: string;
  expert: string;
  image_path: string;
  price: number;
  createdAt: Date;
  expiredAt: Date;
  address: string;
  detailsPost: Object;
}
