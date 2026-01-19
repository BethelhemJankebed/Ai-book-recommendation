import React, { useReducer, useEffect, useCallback } from "react";
import SelectField from "./components/Select";
import genres from "./store/genre.json";
import moods from "./store/mood.json";

const initialState = {
  genre: "",
  mood: "",
  level: "",
  responses: [],
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_GENRE":
      return { ...state, genre: action.payload, mood: "" };

    case "SET_MOOD":
      return { ...state, mood: action.payload };

    case "SET_LEVEL":
      return { ...state, level: action.payload };

    case "FETCH_START":
      return { ...state, loading: true, error: null };

    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        responses: [...state.responses, action.payload],
      };

    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { genre, mood, level, responses, loading, error } = state;

  const availableMoods = moods[genre] || [];

  useEffect(() => {
    if (!genre) dispatch({ type: "SET_MOOD", payload: "" });
  }, [genre]);

  const fetchRecommendations = useCallback(async () => {
    if (!genre || !mood || !level) return;

    dispatch({ type: "FETCH_START" });

    try {
      const API_KEY = import.meta.env.VITE_API_KEY;

      // Gemini models changed; use the current generateContent endpoint
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Recommend 6 books for a ${level} ${genre} reader feeling ${mood}. Explain why.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini error ${res.status}: ${errText}`);
      }

      const data = await res.json();

      // Extract text from candidates -> content -> parts
      const text = data?.candidates
        ?.map((c) =>
          c?.content?.parts
            ?.map((p) => p.text)
            .filter(Boolean)
            .join("\n")
        )
        .filter(Boolean)
        .join("\n");

      if (!text) throw new Error("Empty Gemini response");

      dispatch({ type: "FETCH_SUCCESS", payload: text });
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        payload: err.message || "Something went wrong",
      });
    }
  }, [genre, mood, level]);

  return (
    <section className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">AI Book Recommendation App</h1>

      <SelectField
        placeholder="Select Genre"
        options={genres}
        value={genre}
        onSelect={(v) => dispatch({ type: "SET_GENRE", payload: v })}
      />

      <SelectField
        placeholder="Select Mood"
        options={availableMoods}
        value={mood}
        onSelect={(v) => dispatch({ type: "SET_MOOD", payload: v })}
      />

      <SelectField
        placeholder="Select Reading Level"
        options={["Beginner", "Intermediate", "Expert"]}
        value={level}
        onSelect={(v) => dispatch({ type: "SET_LEVEL", payload: v })}
      />

      <button
        onClick={fetchRecommendations}
        disabled={loading}
        className="bg-indigo-600 px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Generating..." : "Get Recommendation"}
      </button>

      {error && <p className="text-red-500">{error}</p>}

      {responses.map((text, idx) => (
        <details key={idx} className="border border-zinc-700 rounded p-3">
          <summary>Recommendation {idx + 1}</summary>
          <p className="mt-2 whitespace-pre-wrap">{text}</p>
        </details>
      ))}
    </section>
  );
}
