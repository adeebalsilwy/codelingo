type Props = {
  children: React.ReactNode;
  className?: string;
};

export const StickyWrapper = ({ children, className }: Props) => {
  return (
    <div className={`hidden lg:block w-[368px] sticky self-end bottom-6 ${className || ''}`}>
      <div className="min-h-[calc(100vh-48px)] sticky top-6 flex flex-col gap-y-4">
        {children}
      </div>
    </div>
  );
};