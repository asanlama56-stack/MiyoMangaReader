package com.miyomangareader

import android.content.Context
import com.facebook.react.bridge.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import org.kotatsu.parsers.MangaLoaderContext
import org.kotatsu.parsers.MangaParser
import org.kotatsu.parsers.model.*
import org.kotatsu.parsers.repository.MangaRepository
import org.kotatsu.parsers.repository.MangaRepositoryImpl
import java.util.concurrent.TimeUnit

class KotatsuParserModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val context: Context = reactContext
    private val scope = CoroutineScope(Dispatchers.IO)
    private lateinit var repository: MangaRepository
    private var selectedSourceId: String = ""

    init {
        initializeRepository()
    }

    private fun initializeRepository() {
        val httpClient = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()

        val loaderContext = object : MangaLoaderContext() {
            override val httpClient: OkHttpClient = httpClient
            override val preferences: MutableMap<String, String> = mutableMapOf()
        }

        repository = MangaRepositoryImpl(loaderContext)
    }

    override fun getName(): String = "KotatsuParserModule"

    /**
     * Get list of available manga sources
     */
    @ReactMethod
    fun getSources(promise: Promise) {
        scope.launch {
            try {
                val sources = repository.sources
                val sourcesList = Arguments.createArray()

                sources.forEach { source ->
                    val sourceMap = Arguments.createMap()
                    sourceMap.putString("id", source.source.toString())
                    sourceMap.putString("name", source.title)
                    sourceMap.putString("language", source.locale?.language ?: "unknown")
                    sourceMap.putBoolean("available", true)
                    sourcesList.pushMap(sourceMap)
                }

                promise.resolve(sourcesList)
            } catch (e: Exception) {
                promise.reject("GET_SOURCES_ERROR", e.message ?: "Failed to fetch sources", e)
            }
        }
    }

    /**
     * Search manga from a specific source
     * @param sourceId The ID of the source to search in
     * @param query Search query string
     * @param offset Pagination offset
     */
    @ReactMethod
    fun searchManga(sourceId: String, query: String, offset: Int, promise: Promise) {
        scope.launch {
            try {
                selectedSourceId = sourceId

                val source = repository.sources.find { it.source.toString() == sourceId }
                    ?: throw Exception("Source not found: $sourceId")

                val results = source.manga.search(query, offset)
                val mangaList = Arguments.createArray()

                results.forEach { manga ->
                    val mangaMap = Arguments.createMap()
                    mangaMap.putString("id", manga.id.toString())
                    mangaMap.putString("title", manga.title)
                    mangaMap.putString("coverUrl", manga.coverUrl)
                    mangaMap.putString("sourceId", sourceId)
                    mangaList.pushMap(mangaMap)
                }

                promise.resolve(mangaList)
            } catch (e: Exception) {
                promise.reject("SEARCH_ERROR", e.message ?: "Search failed", e)
            }
        }
    }

    /**
     * Get detailed information about a manga
     * @param sourceId The source ID
     * @param mangaId The manga ID
     */
    @ReactMethod
    fun getMangaDetails(sourceId: String, mangaId: String, promise: Promise) {
        scope.launch {
            try {
                val source = repository.sources.find { it.source.toString() == sourceId }
                    ?: throw Exception("Source not found: $sourceId")

                val mangaDetails = source.manga.getDetails(MangaId(mangaId.toLong()))

                val detailsMap = Arguments.createMap()
                detailsMap.putString("id", mangaDetails.id.toString())
                detailsMap.putString("title", mangaDetails.title)
                detailsMap.putString("coverUrl", mangaDetails.coverUrl)
                detailsMap.putString("description", mangaDetails.description)
                detailsMap.putString("author", mangaDetails.author)
                detailsMap.putString("status", mangaDetails.status.name)
                detailsMap.putString("rating", mangaDetails.rating.toString())

                val genresList = Arguments.createArray()
                mangaDetails.genres.forEach { genre ->
                    genresList.pushString(genre.title)
                }
                detailsMap.putArray("genres", genresList)

                promise.resolve(detailsMap)
            } catch (e: Exception) {
                promise.reject("GET_DETAILS_ERROR", e.message ?: "Failed to fetch details", e)
            }
        }
    }

    /**
     * Get chapter list for a manga
     * @param sourceId The source ID
     * @param mangaId The manga ID
     */
    @ReactMethod
    fun getChapterList(sourceId: String, mangaId: String, promise: Promise) {
        scope.launch {
            try {
                val source = repository.sources.find { it.source.toString() == sourceId }
                    ?: throw Exception("Source not found: $sourceId")

                val chapters = source.manga.getChapters(MangaId(mangaId.toLong()))
                val chaptersList = Arguments.createArray()

                chapters.forEach { chapter ->
                    val chapterMap = Arguments.createMap()
                    chapterMap.putString("id", chapter.id.toString())
                    chapterMap.putString("name", chapter.name)
                    chapterMap.putString("number", chapter.number.toString())
                    chapterMap.putDouble("uploadDate", chapter.uploadDate.time.toDouble())
                    chapterMap.putString("scanlator", chapter.scanlator ?: "")
                    chaptersList.pushMap(chapterMap)
                }

                promise.resolve(chaptersList)
            } catch (e: Exception) {
                promise.reject("GET_CHAPTERS_ERROR", e.message ?: "Failed to fetch chapters", e)
            }
        }
    }

    /**
     * Get page list (image URLs) for a chapter
     * @param sourceId The source ID
     * @param chapterId The chapter ID
     */
    @ReactMethod
    fun getPageList(sourceId: String, chapterId: String, promise: Promise) {
        scope.launch {
            try {
                val source = repository.sources.find { it.source.toString() == sourceId }
                    ?: throw Exception("Source not found: $sourceId")

                val pages = source.manga.getPages(ChapterId(chapterId.toLong()))
                val pagesList = Arguments.createArray()

                pages.forEachIndexed { index, page ->
                    val pageMap = Arguments.createMap()
                    pageMap.putInt("index", index)
                    pageMap.putString("url", page.url)
                    pageMap.putInt("height", page.height ?: 0)
                    pageMap.putInt("width", page.width ?: 0)
                    pagesList.pushMap(pageMap)
                }

                promise.resolve(pagesList)
            } catch (e: Exception) {
                promise.reject("GET_PAGES_ERROR", e.message ?: "Failed to fetch pages", e)
            }
        }
    }

    /**
     * Perform global search across all enabled sources
     * @param query Search query
     */
    @ReactMethod
    fun globalSearch(query: String, promise: Promise) {
        scope.launch {
            try {
                val results = Arguments.createArray()
                var completedSources = 0
                val totalSources = repository.sources.size

                repository.sources.forEach { source ->
                    try {
                        val searchResults = source.manga.search(query, 0)
                        searchResults.take(5).forEach { manga ->
                            val mangaMap = Arguments.createMap()
                            mangaMap.putString("id", manga.id.toString())
                            mangaMap.putString("title", manga.title)
                            mangaMap.putString("coverUrl", manga.coverUrl)
                            mangaMap.putString("sourceId", source.source.toString())
                            mangaMap.putString("sourceName", source.title)
                            results.pushMap(mangaMap)
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }

                    completedSources++
                    if (completedSources == totalSources) {
                        promise.resolve(results)
                    }
                }

                if (totalSources == 0) {
                    promise.resolve(results)
                }
            } catch (e: Exception) {
                promise.reject("GLOBAL_SEARCH_ERROR", e.message ?: "Global search failed", e)
            }
        }
    }
}
