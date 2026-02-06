interface HeaderProps {
  description: string;
}

export default function Header({ description }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <span className="header-brand">BST</span>
        <span className="header-title">BINARY SEARCH TREE</span>
      </div>
      <div className="header-center">
        <span className="header-description">{description}</span>
      </div>
      <div className="header-right">
        <span className="header-mode">Exploration Mode</span>
      </div>
    </header>
  );
}
