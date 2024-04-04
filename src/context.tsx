import React, {
  createContext,
  useCallback,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import type WebView from 'react-native-webview';
import type {
  ePubCfi,
  FontSize,
  Location,
  AnnotationType,
  SearchResult,
  Theme,
  Annotation,
  AnnotationStyles,
  Chapter,
  Bookmark,
  SearchOptions,
} from './types';
import * as webViewInjectFunctions from './utils/webViewInjectFunctions';

type ActionMap<M extends { [index: string]: unknown }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

enum Types {
  CHANGE_THEME = 'CHANGE_THEME',
  CHANGE_FONT_SIZE = 'CHANGE_FONT_SIZE',
  CHANGE_FONT_FAMILY = 'CHANGE_FONT_FAMILY',
  SET_AT_START = 'SET_AT_START',
  SET_AT_END = 'SET_AT_END',
  SET_KEY = 'SET_KEY',
  SET_TOTAL_LOCATIONS = 'SET_TOTAL_LOCATIONS',
  SET_CURRENT_LOCATION = 'SET_CURRENT_LOCATION',
  SET_META = 'SET_META',
  SET_PROGRESS = 'SET_PROGRESS',
  SET_LOCATIONS = 'SET_LOCATIONS',
  SET_IS_LOADING = 'SET_IS_LOADING',
  SET_IS_RENDERING = 'SET_IS_RENDERING',
  SET_SEARCH_RESULTS = 'SET_SEARCH_RESULTS',
  SET_IS_SEARCHING = 'SET_IS_SEARCHING',
  SET_ANNOTATIONS = 'SET_ANNOTATIONS',
  SET_CHAPTER = 'SET_CHAPTER',
  SET_CHAPTERS = 'SET_CHAPTERS',
  SET_BOOKMARKS = 'SET_BOOKMARKS',
  SET_IS_BOOKMARKED = 'SET_IS_BOOKMARKED',
}

type BookPayload = {
  [Types.CHANGE_THEME]: Theme;
  [Types.CHANGE_FONT_SIZE]: FontSize;
  [Types.CHANGE_FONT_FAMILY]: string;
  [Types.SET_AT_START]: boolean;
  [Types.SET_AT_END]: boolean;
  [Types.SET_KEY]: string;
  [Types.SET_TOTAL_LOCATIONS]: number;
  [Types.SET_CURRENT_LOCATION]: Location;
  [Types.SET_META]: {
    cover: string | ArrayBuffer | null | undefined;
    author: string;
    title: string;
    description: string;
    language: string;
    publisher: string;
    rights: string;
  };
  [Types.SET_PROGRESS]: number;
  [Types.SET_LOCATIONS]: ePubCfi[];
  [Types.SET_IS_LOADING]: boolean;
  [Types.SET_IS_RENDERING]: boolean;
  [Types.SET_IS_SEARCHING]: boolean;
  [Types.SET_SEARCH_RESULTS]: SearchResult[];
  [Types.SET_ANNOTATIONS]: Annotation[];
  [Types.SET_CHAPTER]: Chapter | null;
  [Types.SET_CHAPTERS]: Chapter[];
  [Types.SET_BOOKMARKS]: Bookmark[];
  [Types.SET_IS_BOOKMARKED]: boolean;
};

type BookActions = ActionMap<BookPayload>[keyof ActionMap<BookPayload>];

type InitialState = {
  theme: Theme;
  fontFamily: string;
  fontSize: FontSize;
  atStart: boolean;
  atEnd: boolean;
  key: string;
  totalLocations: number;
  currentLocation: Location | null;
  meta: {
    cover: string | ArrayBuffer | null | undefined;
    author: string;
    title: string;
    description: string;
    language: string;
    publisher: string;
    rights: string;
  };
  progress: number;
  locations: ePubCfi[];
  isLoading: boolean;
  isRendering: boolean;
  isSearching: boolean;
  searchResults: SearchResult[];
  annotations: Annotation[];
  chapter: Chapter | null;
  chapters: Chapter[];
  bookmarks: Bookmark[];
  isBookmarked: boolean;
};

export const defaultTheme: Theme = {
  'body': {
    background: '#fff',
  },
  'span': {
    color: '#000 !important',
  },
  'p': {
    color: '#000 !important',
  },
  'li': {
    color: '#000 !important',
  },
  'h1': {
    color: '#000 !important',
  },
  'a': {
    'color': '#000 !important',
    'pointer-events': 'auto',
    'cursor': 'pointer',
  },
  '::selection': {
    background: 'lightskyblue',
  },
};

const initialState: InitialState = {
  theme: defaultTheme,
  fontFamily: 'Helvetica',
  fontSize: '12pt',
  atStart: false,
  atEnd: false,
  key: '',
  totalLocations: 0,
  currentLocation: null,
  meta: {
    cover: '',
    author: '',
    title: '',
    description: '',
    language: '',
    publisher: '',
    rights: '',
  },
  progress: 0,
  locations: [],
  isLoading: true,
  isRendering: true,
  isSearching: false,
  searchResults: [],
  annotations: [],
  chapter: null,
  chapters: [],
  bookmarks: [],
  isBookmarked: false,
};

function bookReducer(state: InitialState, action: BookActions): InitialState {
  switch (action.type) {
    case Types.CHANGE_THEME:
      return {
        ...state,
        theme: action.payload,
      };
    case Types.CHANGE_FONT_SIZE:
      return {
        ...state,
        fontSize: action.payload,
      };
    case Types.CHANGE_FONT_FAMILY:
      return {
        ...state,
        fontFamily: action.payload,
      };
    case Types.SET_AT_START:
      return {
        ...state,
        atStart: action.payload,
      };
    case Types.SET_AT_END:
      return {
        ...state,
        atEnd: action.payload,
      };
    case Types.SET_KEY:
      return {
        ...state,
        key: action.payload,
      };
    case Types.SET_TOTAL_LOCATIONS:
      return {
        ...state,
        totalLocations: action.payload,
      };
    case Types.SET_CURRENT_LOCATION:
      return {
        ...state,
        currentLocation: action.payload,
      };
    case Types.SET_META:
      return {
        ...state,
        meta: action.payload,
      };
    case Types.SET_PROGRESS:
      return {
        ...state,
        progress: action.payload,
      };
    case Types.SET_LOCATIONS:
      return {
        ...state,
        locations: action.payload,
      };
    case Types.SET_IS_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case Types.SET_IS_RENDERING:
      return {
        ...state,
        isRendering: action.payload,
      };
    case Types.SET_IS_SEARCHING:
      return {
        ...state,
        isSearching: action.payload,
      };
    case Types.SET_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.payload,
      };
    case Types.SET_ANNOTATIONS:
      return {
        ...state,
        annotations: action.payload,
      };
    case Types.SET_CHAPTER:
      return {
        ...state,
        chapter: action.payload,
      };
    case Types.SET_CHAPTERS:
      return {
        ...state,
        chapters: action.payload,
      };
    case Types.SET_BOOKMARKS:
      return {
        ...state,
        bookmarks: action.payload,
      };
    case Types.SET_IS_BOOKMARKED:
      return {
        ...state,
        isBookmarked: action.payload,
      };
    default:
      return state;
  }
}

export interface ReaderContextProps {
  registerBook: (bookRef: WebView) => void;
  setAtStart: (atStart: boolean) => void;
  setAtEnd: (atEnd: boolean) => void;
  setTotalLocations: (totalLocations: number) => void;
  setCurrentLocation: (location: Location) => void;
  setMeta: (meta: {
    cover: string | ArrayBuffer | null | undefined;
    author: string;
    title: string;
    description: string;
    language: string;
    publisher: string;
    rights: string;
  }) => void;
  setProgress: (progress: number) => void;
  setLocations: (locations: ePubCfi[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsRendering: (isRendering: boolean) => void;

  /**
   * Go to specific location in the book
   * @param {ePubCfi} target {@link ePubCfi}
   */
  goToLocation: (cfi: ePubCfi) => void;

  /**
   * Go to previous page in the book
   */
  goPrevious: () => void;

  /**
   * Go to next page in the book
   */
  goNext: () => void;

  /**
   * Get the total locations of the book
   */
  getLocations: () => ePubCfi[];

  /**
   * Returns the current location of the book
   * @returns {Location} {@link Location}
   */
  getCurrentLocation: () => Location | null;

  /**
   * Returns an object containing the book's metadata
   * @returns { cover: string | ArrayBuffer | null | undefined, author: string, title: string, description: string, language: string, publisher: string, rights: string, }
   */
  getMeta: () => {
    cover: string | ArrayBuffer | null | undefined;
    author: string;
    title: string;
    description: string;
    language: string;
    publisher: string;
    rights: string;
  };

  /**
   * Search for a specific text in the book
   */
  search: (
    term: string,
    page?: number,
    limit?: number,
    options?: SearchOptions
  ) => void;

  setIsSearching: (value: boolean) => void;

  clearSearchResults: () => void;

  /**
   * @param theme {@link Theme}
   * @description Theme object.
   * @example
   * ```
   * selectTheme({ body: { background: '#fff' } });
   * ```
   */
  changeTheme: (theme: Theme) => void;

  /**
   * Change font size of all elements in the book
   * @param font
   * @see https://www.w3schools.com/cssref/css_websafe_fonts.asp
   */
  changeFontFamily: (fontFamily: string) => void;

  /**
   * Change font size of all elements in the book
   * @param {FontSize} size {@link FontSize}
   */
  changeFontSize: (size: FontSize) => void;

  addAnnotation: (
    type: AnnotationType,
    cfiRange: ePubCfi,
    data?: object,
    styles?: AnnotationStyles,
    /**
     * The name of the css class defined in the applied theme that will be used as the icon for the markup.
     * Example of how the class should be defined in the theme file:
     * ```html
     * <style type="text/css">
     *  [ref="epubjs-mk-heart"] {
     *    background: url("data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPScxLj4...") no-repeat;
     *    width: 20px;
     *    height: 20px;
     *    cursor: pointer;
     *    margin-left: 0;
     *  }
     * </style>
     * ```
     *
     *
     * And how it should be defined:
     *
     *
     * ```js
     * addAnnotation('mark', 'epubCfi(20/14...)', {}, undefined, 'epubjs-mk-heart');
     * ```
     */
    iconClass?: string
  ) => void;

  updateAnnotation: (
    annotation: Annotation,
    data?: object,
    styles?: AnnotationStyles
  ) => void;

  removeAnnotation: (annotation: Annotation) => void;

  /**
   * Remove all annotations matching with provided cfi
   */
  removeAnnotationByCfi: (cfiRange: ePubCfi) => void;

  removeAnnotations: (type?: AnnotationType) => void;

  setAnnotations: (annotations: Annotation[]) => void;

  setInitialAnnotations: (annotations: Annotation[]) => void;

  setKey: (key: string) => void;

  setChapter: (chapter: Chapter | null) => void;

  setChapters: (chapters: Chapter[]) => void;

  addBookmark: (location: Location, data?: object) => void;

  removeBookmark: (bookmark: Bookmark) => void;

  removeBookmarks: () => void;

  updateBookmark: (id: number, data: object) => void;

  setBookmarks: (bookmarks: Bookmark[]) => void;

  setIsBookmarked: (isBookmarked: boolean) => void;

  /**
   * Works like a unique id for book
   */
  key: string;

  /**
   * A theme object.
   */
  theme: Theme;

  /**
   * Indicates if you are at the beginning of the book
   * @returns {boolean} {@link boolean}
   */
  atStart: boolean;

  /**
   * Indicates if you are at the end of the book
   * @returns {boolean} {@link boolean}
   */
  atEnd: boolean;

  /**
   * The total number of locations
   */
  totalLocations: number;

  /**
   * The current location of the book
   */
  currentLocation: Location | null;

  /**
   * An object containing the book's metadata
   * { cover: string | ArrayBuffer | null | undefined, author: string, title: string, description: string, language: string, publisher: string, rights: string, }
   */
  meta: {
    cover: string | ArrayBuffer | null | undefined;
    author: string;
    title: string;
    description: string;
    language: string;
    publisher: string;
    rights: string;
  };

  /**
   * The progress of the book
   * @returns {number} {@link number}
   */
  progress: number;

  locations: ePubCfi[];

  /**
   * Indicates if the book is loading
   * @returns {boolean} {@link boolean}
   */
  isLoading: boolean;

  /**
   * Indicates if the book is rendering
   * @returns {boolean} {@link boolean}
   */
  isRendering: boolean;

  isSearching: boolean;

  /**
   * Search results
   * @returns {SearchResult[]} {@link SearchResult[]}
   */
  searchResults: SearchResult[];

  setSearchResults: (results: SearchResult[]) => void;

  removeSelection: () => void;

  annotations: Annotation[];

  chapter: Chapter | null;

  /**
   * also called table of contents(toc)
   */
  chapters: Chapter[];

  bookmarks: Bookmark[];

  /**
   * Indicates if current page is bookmarked
   */
  isBookmarked: boolean;
}

const ReaderContext = createContext<ReaderContextProps>({
  registerBook: () => {},
  setAtStart: () => {},
  setAtEnd: () => {},
  setTotalLocations: () => {},
  setCurrentLocation: () => {},
  setMeta: () => {},
  setProgress: () => {},
  setLocations: () => {},
  setIsLoading: () => {},
  setIsRendering: () => {},

  goToLocation: () => {},
  goPrevious: () => {},
  goNext: () => {},
  getLocations: () => [],
  getCurrentLocation: () => null,
  getMeta: () => ({
    cover: '',
    author: '',
    title: '',
    description: '',
    language: '',
    publisher: '',
    rights: '',
  }),

  search: () => {},
  clearSearchResults: () => {},
  setIsSearching: () => {},

  changeTheme: () => {},
  changeFontFamily: () => {},
  changeFontSize: () => {},

  setKey: () => {},

  setChapter: () => {},
  setChapters: () => {},

  addBookmark: () => {},
  removeBookmark: () => {},
  removeBookmarks: () => {},
  updateBookmark: () => {},
  setBookmarks: () => {},
  setIsBookmarked: () => {},

  key: '',

  theme: defaultTheme,
  atStart: false,
  atEnd: false,
  totalLocations: 0,
  currentLocation: null,
  meta: {
    cover: '',
    author: '',
    title: '',
    description: '',
    language: '',
    publisher: '',
    rights: '',
  },
  progress: 0,
  locations: [],
  isLoading: true,
  isRendering: true,

  isSearching: false,
  searchResults: [],
  setSearchResults: () => {},

  removeSelection: () => {},

  addAnnotation: () => {},
  updateAnnotation: () => {},
  removeAnnotation: () => {},
  removeAnnotationByCfi: () => {},
  removeAnnotations: () => {},
  setAnnotations: () => {},
  setInitialAnnotations: () => {},
  annotations: [],
  chapter: null,
  chapters: [],
  bookmarks: [],
  isBookmarked: false,
});

function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(bookReducer, initialState);
  const book = useRef<WebView | null>(null);

  const registerBook = useCallback((bookRef: WebView) => {
    book.current = bookRef;
  }, []);

  const changeTheme = useCallback((theme: Theme) => {
    book.current?.injectJavaScript(`
      rendition.themes.register({ theme: ${JSON.stringify(theme)} });
      rendition.themes.select('theme');
      rendition.views().forEach(view => view.pane ? view.pane.render() : null); true;
    `);
    dispatch({ type: Types.CHANGE_THEME, payload: theme });
  }, []);

  const changeFontFamily = useCallback((fontFamily: string) => {
    book.current?.injectJavaScript(`
      rendition.themes.font('${fontFamily}');
    `);
    dispatch({ type: Types.CHANGE_FONT_FAMILY, payload: fontFamily });
  }, []);

  const changeFontSize = useCallback((size: FontSize) => {
    book.current?.injectJavaScript(`
      rendition.themes.fontSize('${size}'); true
    `);
    dispatch({ type: Types.CHANGE_FONT_SIZE, payload: size });
  }, []);

  const setAtStart = useCallback((atStart: boolean) => {
    dispatch({ type: Types.SET_AT_START, payload: atStart });
  }, []);

  const setAtEnd = useCallback((atEnd: boolean) => {
    dispatch({ type: Types.SET_AT_END, payload: atEnd });
  }, []);

  const setTotalLocations = useCallback((totalLocations: number) => {
    dispatch({ type: Types.SET_TOTAL_LOCATIONS, payload: totalLocations });
  }, []);

  const setCurrentLocation = useCallback((location: Location) => {
    dispatch({ type: Types.SET_CURRENT_LOCATION, payload: location });
  }, []);

  const setMeta = useCallback(
    (meta: {
      cover: string | ArrayBuffer | null | undefined;
      author: string;
      title: string;
      description: string;
      language: string;
      publisher: string;
      rights: string;
    }) => {
      dispatch({ type: Types.SET_META, payload: meta });
    },
    []
  );

  const setProgress = useCallback((progress: number) => {
    dispatch({ type: Types.SET_PROGRESS, payload: progress });
  }, []);

  const setLocations = useCallback((locations: ePubCfi[]) => {
    dispatch({ type: Types.SET_LOCATIONS, payload: locations });
  }, []);

  const setIsLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: Types.SET_IS_LOADING, payload: isLoading });
  }, []);

  const setIsRendering = useCallback((isRendering: boolean) => {
    dispatch({ type: Types.SET_IS_RENDERING, payload: isRendering });
  }, []);

  const goToLocation = useCallback((targetCfi: ePubCfi) => {
    book.current?.injectJavaScript(`rendition.display('${targetCfi}'); true`);
  }, []);

  const goPrevious = useCallback(() => {
    book.current?.injectJavaScript(`rendition.prev(); true`);
  }, []);

  const goNext = useCallback(() => {
    book.current?.injectJavaScript(`rendition.next(); true`);
  }, []);

  const getLocations = useCallback(() => state.locations, [state.locations]);

  const getCurrentLocation = useCallback(
    () => state.currentLocation,
    [state.currentLocation]
  );

  const getMeta = useCallback(() => state.meta, [state.meta]);

  const search = useCallback(
    (term: string, page?: number, limit?: number, options?: SearchOptions) => {
      dispatch({ type: Types.SET_SEARCH_RESULTS, payload: [] });
      dispatch({ type: Types.SET_IS_SEARCHING, payload: true });

      webViewInjectFunctions.injectJavaScript(
        book,
        `
      const page = ${page || 1};
      const limit = ${limit || 20};
      const term = ${JSON.stringify(term)};
      const chapterId = ${options?.chapterId};
      const highlightTerm = ${options?.highlightTerm || true};
      const highlightTermColor = ${JSON.stringify(options?.highlightTermColor || 'yellow')}
      const highlightTermDuration = ${options?.highlightTermDuration || 3000};

      if (!term) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: 'onSearch', results: [] })
        );
      } else {
        Promise.all(
          book.spine.spineItems.map((item) => {
            return item.load(book.load.bind(book)).then(() => {
              let results = item.find(term.trim());
              const locationHref = item.href;

              let [match] = flatten(book.navigation.toc)
              .filter((chapter, index) => {
                  return book.canonical(chapter.href).includes(locationHref)
              }, null);

              if (results.length > 0) {
                results = results.map(result => ({ ...result, chapter: { ...match, index: book.navigation.toc.findIndex(elem => elem.id === match?.id) } }));

                if (chapterId) {
                  results = results.filter(result => result.chapter.id === chapterId);
                }
              }

              item.unload();
              return Promise.resolve(results);
            });
          })
        ).then((results) => {
          const items = [].concat.apply([], results);
          items.forEach(item => {
            if (highlightTerm) {
              rendition.annotations.highlight(item.cfi, {}, () => {});

              setTimeout(() => {
                rendition.annotations.remove(item.cfi, 'highlight');
              }, highlightTermDuration);
            }
          });

          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'onSearch', results: items.slice((page - 1) * limit, page * limit) })
          );
        }).catch(err => {
          alert(err?.message);

          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'onSearch', results: [] })
          );
        })
      }
    `
      );
    },
    []
  );

  const clearSearchResults = useCallback(() => {
    dispatch({ type: Types.SET_SEARCH_RESULTS, payload: [] });
  }, []);

  const setIsSearching = useCallback((value: boolean) => {
    dispatch({ type: Types.SET_IS_SEARCHING, payload: value });
  }, []);

  const setSearchResults = useCallback((results: SearchResult[]) => {
    dispatch({ type: Types.SET_SEARCH_RESULTS, payload: results });
  }, []);

  const addAnnotation = useCallback(
    (
      type: AnnotationType,
      cfiRange: string,
      data?: object,
      styles?: {
        color?: string;
        opacity?: number;
        thickness?: number;
      },
      iconClass = ''
    ) => {
      webViewInjectFunctions.injectJavaScript(
        book,
        `
          ${webViewInjectFunctions.addAnnotation(type, cfiRange, data, iconClass, styles)}

          ${webViewInjectFunctions.onChangeAnnotations()}
        `
      );
    },
    []
  );

  const updateAnnotation = useCallback(
    (annotation: Annotation, data = {}, styles?: AnnotationStyles) => {
      webViewInjectFunctions.injectJavaScript(
        book,
        webViewInjectFunctions.updateAnnotation(annotation, data, styles)
      );
    },
    []
  );

  const removeAnnotation = useCallback((annotation: Annotation) => {
    webViewInjectFunctions.injectJavaScript(
      book,
      `
        rendition.annotations.remove(${JSON.stringify(annotation.cfiRange)}, ${JSON.stringify(annotation.type)});

        ${webViewInjectFunctions.onChangeAnnotations()}
    `
    );
  }, []);

  const removeAnnotationByCfi = useCallback((cfiRange: string) => {
    webViewInjectFunctions.injectJavaScript(
      book,
      `
        ['highlight', 'underline', 'mark'].forEach(type => {
          rendition.annotations.remove('${cfiRange}', type);
        });

        ${webViewInjectFunctions.onChangeAnnotations()}
    `
    );
  }, []);

  const removeAnnotations = useCallback((type?: AnnotationType) => {
    webViewInjectFunctions.injectJavaScript(
      book,
      `
        let annotations = Object.values(rendition.annotations._annotations);

        if (typeof ${type} === 'string') {
          annotations = annotations.filter(annotation => annotation.type === ${type});
        }

        annotations.forEach(annotation => {
          rendition.annotations.remove(annotation.cfiRange, annotation.type);
        });

        ${webViewInjectFunctions.onChangeAnnotations()}
      `
    );
  }, []);

  const setAnnotations = useCallback((annotations: Annotation[]) => {
    dispatch({ type: Types.SET_ANNOTATIONS, payload: annotations });
  }, []);

  const setInitialAnnotations = useCallback((annotations: Annotation[]) => {
    annotations.forEach((annotation) => {
      webViewInjectFunctions.injectJavaScript(
        book,
        webViewInjectFunctions.addAnnotation(
          annotation.type,
          annotation.cfiRange,
          annotation.data,
          annotation.iconClass,
          annotation.styles,
          annotation.cfiRangeText,
          true
        )
      );
    });

    const transform = JSON.stringify(annotations);
    webViewInjectFunctions.injectJavaScript(
      book,
      `
        const initialAnnotations = JSON.stringify(${transform});

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'onSetInitialAnnotations',
          annotations: ${webViewInjectFunctions.mapArrayObjectsToAnnotations('JSON.parse(initialAnnotations)')}
        }));
      `
    );
  }, []);

  const setKey = useCallback((key: string) => {
    dispatch({ type: Types.SET_KEY, payload: key });
  }, []);

  const removeSelection = useCallback(() => {
    webViewInjectFunctions.injectJavaScript(
      book,
      `
        const getSelections = () => rendition.getContents().map(contents => contents.window.getSelection());
        const clearSelection = () => getSelections().forEach(s => s.removeAllRanges());
        clearSelection();
    `
    );
  }, []);

  const setChapter = useCallback((chapter: Chapter | null) => {
    dispatch({ type: Types.SET_CHAPTER, payload: chapter });
  }, []);

  const setChapters = useCallback((chapters: Chapter[]) => {
    dispatch({ type: Types.SET_CHAPTERS, payload: chapters });
  }, []);

  const addBookmark = useCallback((location: Location, data?: object) => {
    webViewInjectFunctions.injectJavaScript(
      book,
      `
      const location = ${JSON.stringify(location)};
      const chapter = getChapter(${JSON.stringify(location)});
      const cfi = makeRangeCfi(location.start.cfi, location.end.cfi);
      const data = ${JSON.stringify(data)};

      book.getRange(cfi).then(range => {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "onAddBookmark",
          bookmark: {
            id: Date.now(),
            chapter,
            location,
            text: range.toString(),
            data,
          },
        }));
      }).catch(error => alert(error?.message));
    `
    );
  }, []);

  const removeBookmark = useCallback(
    (bookmark: Bookmark) => {
      webViewInjectFunctions.injectJavaScript(
        book,
        `
        const bookmark = ${JSON.stringify(bookmark)};
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "onRemoveBookmark",
          bookmark,
        }));
      `
      );

      dispatch({
        type: Types.SET_BOOKMARKS,
        payload: state.bookmarks.filter(({ id }) => id !== bookmark.id),
      });
    },
    [state.bookmarks]
  );

  const removeBookmarks = useCallback(() => {
    dispatch({
      type: Types.SET_BOOKMARKS,
      payload: [],
    });

    webViewInjectFunctions.injectJavaScript(
      book,
      `
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: "onRemoveBookmarks",
      }));
    `
    );
  }, []);

  const setBookmarks = useCallback((bookmarks: Bookmark[]) => {
    dispatch({ type: Types.SET_BOOKMARKS, payload: bookmarks });
  }, []);

  const updateBookmark = useCallback(
    (id: number, data: object) => {
      const { bookmarks } = state;
      const bookmark = state.bookmarks.find((item) => item.id === id);

      if (!bookmark) return;

      bookmark.data = data;

      const index = state.bookmarks.findIndex((item) => item.id === id);
      bookmarks[index] = bookmark;

      dispatch({ type: Types.SET_BOOKMARKS, payload: bookmarks });

      webViewInjectFunctions.injectJavaScript(
        book,
        `
        const bookmark = ${JSON.stringify(bookmark)};
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "onUpdateBookmark",
          bookmark,
        }));
      `
      );
    },
    [state]
  );

  const setIsBookmarked = useCallback((value: boolean) => {
    dispatch({ type: Types.SET_IS_BOOKMARKED, payload: value });
  }, []);

  const contextValue = useMemo(
    () => ({
      registerBook,
      setAtStart,
      setAtEnd,
      setTotalLocations,
      setCurrentLocation,
      setMeta,
      setProgress,
      setLocations,
      setIsLoading,
      setIsRendering,

      goToLocation,
      goPrevious,
      goNext,
      getLocations,
      getCurrentLocation,
      getMeta,

      search,
      clearSearchResults,
      setIsSearching,

      setKey,
      key: state.key,

      changeTheme,
      changeFontFamily,
      changeFontSize,
      theme: state.theme,

      atStart: state.atStart,
      atEnd: state.atEnd,
      totalLocations: state.totalLocations,
      currentLocation: state.currentLocation,
      meta: state.meta,
      progress: state.progress,
      locations: state.locations,
      isLoading: state.isLoading,
      isRendering: state.isRendering,

      isSearching: state.isSearching,
      searchResults: state.searchResults,
      setSearchResults,

      removeSelection,

      addAnnotation,
      updateAnnotation,
      removeAnnotation,
      removeAnnotationByCfi,
      removeAnnotations,
      setAnnotations,
      setInitialAnnotations,
      annotations: state.annotations,

      setChapter,
      setChapters,
      chapter: state.chapter,
      chapters: state.chapters,

      addBookmark,
      removeBookmark,
      removeBookmarks,
      updateBookmark,
      setBookmarks,
      bookmarks: state.bookmarks,
      setIsBookmarked,
      isBookmarked: state.isBookmarked,
    }),
    [
      changeFontFamily,
      changeFontSize,
      changeTheme,
      getCurrentLocation,
      getMeta,
      getLocations,
      goNext,
      goPrevious,
      goToLocation,
      registerBook,
      search,
      clearSearchResults,
      setIsSearching,
      setAtEnd,
      setAtStart,
      setCurrentLocation,
      setMeta,
      setIsLoading,
      setIsRendering,
      setKey,
      setLocations,
      setProgress,
      setSearchResults,
      setTotalLocations,
      removeSelection,
      addAnnotation,
      updateAnnotation,
      removeAnnotation,
      removeAnnotationByCfi,
      removeAnnotations,
      setAnnotations,
      setInitialAnnotations,
      state.atEnd,
      state.atStart,
      state.currentLocation,
      state.meta,
      state.isLoading,
      state.isRendering,
      state.key,
      state.locations,
      state.progress,
      state.isSearching,
      state.searchResults,
      state.theme,
      state.totalLocations,
      state.annotations,
      setChapter,
      setChapters,
      state.chapter,
      state.chapters,
      addBookmark,
      removeBookmark,
      removeBookmarks,
      updateBookmark,
      setBookmarks,
      state.bookmarks,
      state.isBookmarked,
      setIsBookmarked,
    ]
  );
  return (
    <ReaderContext.Provider value={contextValue}>
      {children}
    </ReaderContext.Provider>
  );
}

export { ReaderProvider, ReaderContext };
