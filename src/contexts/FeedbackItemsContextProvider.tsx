import { createContext, useMemo, useState } from "react";
import { TFeedbackItem } from "../lib/types";
import { useFeedbackItems } from "../lib/hooks";

type FeedbackItemsContextProviderProps = {
  children: React.ReactNode;
};

type TFeedbackItemsContext = {
  isLoading: boolean;
  filteredFeedbackItems: TFeedbackItem[];
  handleSelectedCompany: (company: string) => void;
  errorMessage: string;
  companyList: string[];
  handleAddToList: (text: string) => void;
};

export const FeedbackItemContext = createContext<TFeedbackItemsContext | null>(
  null
);

export default function FeedbackItemsContextProvider({
  children,
}: FeedbackItemsContextProviderProps) {
  const [selectedCompany, setSelectedCompany] = useState("");
  const { feedbackItems, isLoading, errorMessage, setFeedbackItems } =
    useFeedbackItems();

  const companyList = useMemo(
    () =>
      feedbackItems
        .map((item) => item.company)
        .filter((company, index, array) => {
          return array.indexOf(company) === index; // remove duplicates
        }),
    [feedbackItems]
  );

  const filteredFeedbackItems = useMemo(
    () =>
      selectedCompany
        ? feedbackItems.filter((item) => item.company === selectedCompany)
        : feedbackItems,
    [feedbackItems, selectedCompany]
  );

  const handleAddToList = async (text: string) => {
    const companyName = text
      .split(" ")
      .find((word) => word.includes("#"))!
      .substring(1);

    const newItem: TFeedbackItem = {
      id: new Date().getTime(),
      text: text,
      upvoteCount: 0,
      daysAgo: 0,
      company: companyName,
      badgeLetter: companyName.substring(0, 1).toUpperCase(),
    };

    setFeedbackItems([...feedbackItems, newItem]);

    await fetch(
      "https://bytegrad.com/course-assets/projects/corpcomment/api/feedbacks",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      }
    );
  };

  const handleSelectedCompany = (company: string) => {
    setSelectedCompany(company);
  };

  return (
    <FeedbackItemContext.Provider
      value={{
        filteredFeedbackItems,
        handleSelectedCompany,
        isLoading,
        errorMessage,
        companyList,
        handleAddToList,
      }}
    >
      {children}
    </FeedbackItemContext.Provider>
  );
}
