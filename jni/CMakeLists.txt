cmake_minimum_required(VERSION 3.22.1)
project(edgeproc)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(edgeproc SHARED
    src/native-lib.cpp)

find_library(log-lib log)

# OpenCV (optional discovery here; can also be pointed via OpenCV_DIR)
find_package(OpenCV QUIET)
if(OpenCV_FOUND)
    message(STATUS "OpenCV found: ${OpenCV_VERSION}")
    target_include_directories(edgeproc PRIVATE ${OpenCV_INCLUDE_DIRS})
    target_link_libraries(edgeproc PRIVATE ${OpenCV_LIBS})
else()
    message(WARNING "OpenCV not found at configure time. Configure OpenCV_DIR for full functionality.")
endif()

target_link_libraries(edgeproc PRIVATE ${log-lib})


