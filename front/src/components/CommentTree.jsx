import React from 'react';

export default function CommentTree({ list = [], onReply, onDelete, currentUser }) {
  return (
    <div className="comment-tree">
      {list.map((comment) => (
        <CommentNode key={comment.id} item={comment} onReply={onReply} onDelete={onDelete} currentUser={currentUser} />
      ))}
    </div>
  );
}

function CommentNode({ item, onReply, onDelete, currentUser }) {
  const canDelete = currentUser && (currentUser.id === item.userId || currentUser.role === 'admin' || currentUser.role === 'super_admin');
  return (
    <div className="comment-node">
      <div className="comment-header">
        <strong>{item.author?.username || '匿名用户'}</strong>
        {item.replyUser?.username && <span>回复 @{item.replyUser.username}</span>}
      </div>
      <p>{item.content}</p>
      <div className="comment-actions">
        {currentUser && <button onClick={() => onReply(item)}>回复</button>}
        {canDelete && <button onClick={() => onDelete(item.id)}>删除</button>}
      </div>
      {item.children?.length > 0 && (
        <div className="comment-children">
          {item.children.map((child) => (
            <CommentNode key={child.id} item={child} onReply={onReply} onDelete={onDelete} currentUser={currentUser} />
          ))}
        </div>
      )}
    </div>
  );
}
