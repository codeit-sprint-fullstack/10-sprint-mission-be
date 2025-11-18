export class Article {
  _title;

  _content;

  _likeCount;

  constructor(title, content, likeCount) {
    this._title = title;
    this._content = content;
    this._likeCount = likeCount;
  }

  getTitle() {
    return this._title;
  }

  getContent() {
    return this._content;
  }

  getLikeCount() {
    return this._likeCount;
  }

  getCreatedAt() {
    return this._createdAt;
  }

  like() {
    this._likeCount++;
  }
}
