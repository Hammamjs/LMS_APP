export class CreateCourseParams {
  constructor(
    public title: string,
    public price: number,
    public hours: number,
    public description: string,
    public instructorId: string,
    public image: string | null,
    public category: string,
  ) {}
}
