export class UpdateCourseParams {
  constructor(
    public id: string,
    public userId: string,
    public title?: string,
    public price?: number,
    public hours?: number,
    public description?: string,
    public image?: string,
    public category?: string,
  ) {}
}
