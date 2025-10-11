interface CardProps {
  title: string;

  icon?: any;
  children: any;
}

export const Card = ({ children, title, icon: Icon }: CardProps) => (
  <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
    {title && (
      <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-600" />}
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
    )}
    <div className="p-4">{children}</div>
  </div>
);
