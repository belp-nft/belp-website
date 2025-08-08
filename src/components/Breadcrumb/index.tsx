import clsx from "clsx";
import Link from "next/link";
import { HiChevronRight } from "react-icons/hi";

export default function BreadCrumbs({
  breadcrumbs,
}: {
  breadcrumbs: {
    href?: string;
    label: string;
  }[];
}) {
  return (
    <div className={`flex items-center`}>
      {breadcrumbs.map((breadcrumb, index) => (
        <span key={index}>
          {breadcrumb.href ? (
            <div className="flex items-center">
              <Link
                className={clsx(
                  "hover:text-primary hover:opacity-100 hover:underline text-14",
                  index === 0 && "opacity-50"
                )}
                href={breadcrumb.href}
              >
                <span>{breadcrumb.label}</span>
              </Link>
              {index < breadcrumbs.length - 1 && (
                <HiChevronRight className="mx-2 text-gray-400" />
              )}
            </div>
          ) : (
            <a className="text-primary">
              <span>{breadcrumb.label}</span>
            </a>
          )}
        </span>
      ))}
    </div>
  );
}
